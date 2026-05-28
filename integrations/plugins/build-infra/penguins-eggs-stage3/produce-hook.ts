/**
 * plugins/build-infra/penguins-eggs-stage3/produce-hook.ts
 *
 * Pre-produce hook: build a stage3 rootfs for a target distro/arch and
 * use it as the source for eggs produce.
 *
 * Usage in ovary.d/produce.ts:
 *   import { stage3PrepareRootfs } from './integrations/stage3-hook.js'
 *   const rootfsDir = await stage3PrepareRootfs(workDir, exec, verbose, config)
 *   // pass rootfsDir to mksquashfs/mkdwarfs/mkfs.erofs
 */

import os from 'node:os'
import path from 'node:path'
import { PenguinsEggsStage3, Stage3Config, Stage3Result } from './penguins-eggs-stage3.js'

type ExecFn = (cmd: string, opts?: { capture?: boolean; echo?: boolean }) => Promise<{
  code: number
  data: string
  error?: string
}>

/**
 * Build a stage3 rootfs and return its directory path for use as eggs produce source.
 *
 * @param workDir  Scratch directory for the build
 * @param exec     eggs exec function
 * @param verbose  Enable verbose output
 * @param config   Stage3 configuration (distro, release, arch, etc.)
 * @returns        Path to the extracted rootfs directory
 */
export async function stage3PrepareRootfs(
  workDir: string,
  exec: ExecFn,
  verbose: boolean,
  config: Stage3Config = {}
): Promise<string> {
  const stage3 = new PenguinsEggsStage3(exec, verbose, config)

  const { ok, missing } = await stage3.checkPrerequisites()
  if (!ok) {
    throw new Error(
      'penguins-eggs-stage3 prerequisites not met:\n' +
      missing.map(m => `  - ${m}`).join('\n') + '\n' +
      'Run as root with required tools installed.'
    )
  }

  const tarballPath = await stage3.buildStage3(workDir)
  console.log(`stage3: tarball ready: ${tarballPath}`)

  const rootfsDir = await stage3.prepareRootfs(tarballPath, workDir)
  console.log(`stage3: rootfs ready: ${rootfsDir}`)
  return rootfsDir
}

/**
 * Build a naked base ISO for a target distro/arch.
 * Returns the full build result including tarball and ISO paths.
 *
 * @param workDir  Scratch directory for the build
 * @param exec     eggs exec function
 * @param verbose  Enable verbose output
 * @param config   Stage3 configuration
 * @returns        Stage3Result with tarball and ISO paths
 */
export async function stage3BuildNaked(
  workDir: string,
  exec: ExecFn,
  verbose: boolean,
  config: Stage3Config = {}
): Promise<Stage3Result> {
  const stage3 = new PenguinsEggsStage3(exec, verbose, config)

  const { ok, missing } = await stage3.checkPrerequisites()
  if (!ok) {
    throw new Error(
      'penguins-eggs-stage3 prerequisites not met:\n' +
      missing.map(m => `  - ${m}`).join('\n')
    )
  }

  const result = await stage3.buildNaked(workDir)

  console.log(`stage3: build complete`)
  console.log(`  tarball: ${result.tarballPath} (${(result.tarballBytes / 1024 / 1024).toFixed(0)} MiB)`)
  if (result.isoPath) {
    console.log(`  ISO:     ${result.isoPath} (${((result.isoBytes ?? 0) / 1024 / 1024).toFixed(0)} MiB)`)
  }

  return result
}
