/**
 * plugins/build-infra/penguins-eggs-prefix/produce-hook.ts
 *
 * Pre-produce hook: build a penguins-eggs-prefix tarball and use it as the
 * source directory for eggs produce instead of the running system.
 *
 * Integration points:
 *
 *   1. ROOTFS SOURCE MODE (--eggs-prefix):
 *      Build a penguins-eggs-prefix tarball, extract it, pass the rootfs dir
 *      to mksquashfs/mkdwarfs/mkfs.erofs as the source tree.
 *
 *   2. CROSS-ARCH MODE (--eggs-prefix --eggs-prefix-arch arm64):
 *      Build a foreign-arch prefix on an amd64 host via QEMU binfmt_misc,
 *      then produce an arm64 ISO from the amd64 runner.
 *
 *   3. PRE-SEEDED MODE (--eggs-prefix-base /path/to/linux-distro-prefix.tar.gz):
 *      Skip the full Gentoo bootstrap (~1 hour) by pre-seeding from a
 *      linux-distro-prefix tarball. Only the penguins-eggs package install runs.
 *
 * Called from src/commands/produce.ts when --eggs-prefix flag is set.
 */

import os from 'node:os'
import path from 'node:path'
import { PrefixBuilder, PrefixOptions, PrefixResult, prefixExtract } from './prefix.js'

type ExecFn = (cmd: string, opts?: { capture?: boolean; echo?: boolean }) => Promise<{
  code: number
  data: string
  error?: string
}>

export interface PrefixHookOptions extends PrefixOptions {
  /** Working directory for the build. Default: system temp */
  workDir?: string
  /** If true, keep the rootfs directory after produce completes */
  keepRootfs?: boolean
}

export interface PrefixHookResult {
  /** Path to the extracted rootfs — pass to eggs produce as source */
  rootfsDir: string
  /** The prefix build result (tarball path, size, etc.) */
  prefix: PrefixResult
  /** Call this to clean up the rootfs directory when done */
  cleanup: () => void
}

/**
 * Build a penguins-eggs-prefix and prepare a rootfs directory for eggs produce.
 *
 * @example
 * ```ts
 * const { rootfsDir, cleanup } = await prefixPrepareForProduce(exec, verbose, {
 *   distro: 'debian', release: 'trixie', arch: 'amd64'
 * })
 * process.env['EGGS_PREFIX_ROOTFS'] = rootfsDir
 * // ... run eggs produce ...
 * cleanup()
 * ```
 */
export async function prefixPrepareForProduce(
  exec: ExecFn,
  verbose: boolean,
  opts: PrefixHookOptions = {}
): Promise<PrefixHookResult> {
  const workDir = opts.workDir ?? path.join(os.tmpdir(), `eggs-prefix-${Date.now()}`)
  const builder = new PrefixBuilder(exec, verbose, opts)

  // Prerequisites check
  const { ok, missing } = await builder.checkPrerequisites()
  if (!ok) {
    throw new Error(
      'penguins-eggs-prefix prerequisites not met:\n' +
      missing.map(m => `  - ${m}`).join('\n') + '\n\n' +
      'Install missing tools and run as root (sudo eggs produce --eggs-prefix ...).'
    )
  }

  // Build the prefix tarball
  const prefix = await builder.build(workDir)
  console.log(
    `prefix: tarball ready: ${prefix.tarballPath} ` +
    `(${(prefix.bytes / 1024 / 1024).toFixed(0)} MiB)`
  )

  // Extract to rootfs directory
  const rootfsDir = path.join(workDir, 'rootfs')
  await prefixExtract(prefix.tarballPath, rootfsDir, exec, verbose)
  console.log(`prefix: rootfs ready: ${rootfsDir}`)

  const cleanup = () => {
    if (!opts.keepRootfs) {
      try {
        const { execSync } = require('node:child_process')
        execSync(`rm -rf "${rootfsDir}"`)
        if (verbose) console.log(`prefix: cleaned up ${rootfsDir}`)
      } catch {
        // best-effort
      }
    }
  }

  return { rootfsDir, prefix, cleanup }
}
