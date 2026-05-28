/**
 * plugins/build-infra/linux-distro-stage3/produce-hook.ts
 *
 * Pre-produce hook: build a linux-distro-stage3 rootfs and use it as the
 * source directory for eggs produce instead of the running system.
 *
 * Integration points:
 *
 *   1. ROOTFS SOURCE MODE (--stage3):
 *      Build a stage3 tarball, extract it, pass the rootfs dir to
 *      mksquashfs/mkdwarfs/mkfs.erofs as the source tree.
 *
 *   2. CROSS-ARCH MODE (--stage3 --stage3-arch arm64):
 *      Build a foreign-arch stage3 on an amd64 host via QEMU binfmt_misc,
 *      then produce an arm64 ISO from the amd64 runner.
 *
 * Called from src/commands/produce.ts when --stage3 flag is set.
 */

import os from 'node:os'
import path from 'node:path'
import { Stage3Builder, Stage3Options, Stage3Result, stage3Extract } from './stage3.js'

type ExecFn = (cmd: string, opts?: { capture?: boolean; echo?: boolean }) => Promise<{
  code: number
  data: string
  error?: string
}>

export interface Stage3HookOptions extends Stage3Options {
  /** Working directory for the build. Default: system temp */
  workDir?: string
  /** If true, keep the rootfs directory after produce completes */
  keepRootfs?: boolean
}

export interface Stage3HookResult {
  /** Path to the extracted rootfs — pass to eggs produce as source */
  rootfsDir: string
  /** The stage3 build result (tarball path, size, etc.) */
  stage3: Stage3Result
  /** Call this to clean up the rootfs directory when done */
  cleanup: () => void
}

/**
 * Build a stage3 and prepare a rootfs directory for eggs produce.
 *
 * @example
 * ```ts
 * const { rootfsDir, cleanup } = await stage3PrepareForProduce(exec, verbose, {
 *   distro: 'debian', release: 'trixie', arch: 'amd64'
 * })
 * // ... run eggs produce with rootfsDir as source ...
 * cleanup()
 * ```
 */
export async function stage3PrepareForProduce(
  exec: ExecFn,
  verbose: boolean,
  opts: Stage3HookOptions = {}
): Promise<Stage3HookResult> {
  const workDir = opts.workDir ?? path.join(os.tmpdir(), `eggs-stage3-${Date.now()}`)
  const builder = new Stage3Builder(exec, verbose, opts)

  // Prerequisites check
  const { ok, missing } = await builder.checkPrerequisites()
  if (!ok) {
    throw new Error(
      'linux-distro-stage3 prerequisites not met:\n' +
      missing.map(m => `  - ${m}`).join('\n') + '\n\n' +
      'Install missing tools and run as root (sudo eggs produce --stage3 ...).'
    )
  }

  // Build the stage3 tarball
  const stage3 = await builder.build(workDir)
  console.log(
    `stage3: tarball ready: ${stage3.tarballPath} ` +
    `(${(stage3.bytes / 1024 / 1024).toFixed(0)} MiB)`
  )

  // Extract to rootfs directory
  const rootfsDir = path.join(workDir, 'rootfs')
  await stage3Extract(stage3.tarballPath, rootfsDir, exec, verbose)
  console.log(`stage3: rootfs ready: ${rootfsDir}`)

  const cleanup = () => {
    if (!opts.keepRootfs) {
      try {
        const { execSync } = require('node:child_process')
        execSync(`rm -rf "${rootfsDir}"`)
        if (verbose) console.log(`stage3: cleaned up ${rootfsDir}`)
      } catch {
        // best-effort
      }
    }
  }

  return { rootfsDir, stage3, cleanup }
}
