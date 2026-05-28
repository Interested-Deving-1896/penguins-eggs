/**
 * plugins/build-infra/penguins-eggs-prefix/prefix.ts
 *
 * penguins-eggs-prefix integration for penguins-eggs.
 *
 * penguins-eggs-prefix (https://github.com/Interested-Deving-1896/penguins-eggs-prefix)
 * builds a Gentoo prefix extended with ISO production tools (squashfs-tools,
 * xorriso, grub, syslinux) on top of any supported Linux distro and CPU
 * architecture. The prefix tarball is extracted and used as the rootfs source
 * for eggs produce instead of the running system.
 *
 * This module provides:
 *   - PrefixBuilder: clone/update the repo and invoke build.sh
 *   - prefixTarballs(): list available tarballs in a directory
 *   - prefixExtract(): extract a tarball to a rootfs directory
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export type PrefixDistro =
  | 'debian' | 'ubuntu' | 'devuan'
  | 'arch'   | 'fedora' | 'alpine'
  | 'void'   | 'opensuse' | 'gentoo'

export type PrefixArch =
  | 'amd64'   | 'arm64'  | 'armhf'
  | 'riscv64' | 'ppc64el'| 's390x'
  | 'loong64' | 'i386'

export interface PrefixOptions {
  /** Target distro. Default: debian */
  distro?: PrefixDistro
  /** Distro release. Default: trixie (Debian), noble (Ubuntu), etc. */
  release?: string
  /** Target architecture. Default: amd64 */
  arch?: PrefixArch
  /** Path to a local penguins-eggs-prefix checkout. Auto-cloned if absent. */
  repoPath?: string
  /** Path to a local linux-distro-prefix tarball to pre-seed the bootstrap. */
  basePrefixTarball?: string
  /** Path to a local linux-distro-stage3 tarball for the chroot base. */
  stage3Tarball?: string
  /** Directory to write the tarball to. Default: cwd */
  outputDir?: string
  /** Parallel build jobs. Default: nproc */
  jobs?: number
  /** Also produce a naked base ISO. Default: false */
  buildIso?: boolean
}

export interface PrefixResult {
  /** Absolute path to the produced tarball */
  tarballPath: string
  /** Absolute path to the sha256 file */
  sha256Path: string
  /** Absolute path to the produced ISO, if buildIso was true */
  isoPath?: string
  distro: PrefixDistro
  arch: PrefixArch
  /** Tarball size in bytes */
  bytes: number
}

const REPO_URL = 'https://github.com/Interested-Deving-1896/penguins-eggs-prefix'

const DEFAULT_RELEASES: Record<PrefixDistro, string> = {
  debian:   'trixie',
  ubuntu:   'noble',
  devuan:   'excalibur',
  arch:     'rolling',
  fedora:   '42',
  alpine:   '3.21',
  void:     'rolling',
  opensuse: 'tumbleweed',
  gentoo:   'rolling',
}

type ExecFn = (cmd: string, opts?: { capture?: boolean; echo?: boolean }) => Promise<{
  code: number
  data: string
  error?: string
}>

export class PrefixBuilder {
  private exec: ExecFn
  private verbose: boolean
  private opts: PrefixOptions

  constructor(exec: ExecFn, verbose = false, opts: PrefixOptions = {}) {
    this.exec = exec
    this.verbose = verbose
    this.opts = opts
  }

  get distro(): PrefixDistro { return this.opts.distro  ?? 'debian' }
  get release(): string       { return this.opts.release ?? DEFAULT_RELEASES[this.distro] }
  get arch(): PrefixArch      { return this.opts.arch    ?? 'amd64' }
  get outputDir(): string     { return this.opts.outputDir ?? process.cwd() }
  get jobs(): number          { return this.opts.jobs ?? os.cpus().length }

  /** Verify root access and required host tools. */
  async checkPrerequisites(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = []

    const uid = await this.exec('id -u', { capture: true })
    if (uid.data.trim() !== '0') missing.push('root (run with sudo)')

    for (const tool of ['git', 'curl', 'tar']) {
      const r = await this.exec(`command -v ${tool}`, { capture: true })
      if (r.code !== 0) missing.push(tool)
    }

    // Cross-arch needs QEMU
    const hostArch = os.arch()
    if (hostArch === 'x64' && this.arch !== 'amd64' && this.arch !== 'i386') {
      const r = await this.exec('command -v qemu-aarch64-static', { capture: true })
      if (r.code !== 0) missing.push('qemu-user-static (for cross-arch builds)')
    }

    return { ok: missing.length === 0, missing }
  }

  /** Clone or update the penguins-eggs-prefix repo. Returns the repo path. */
  async ensureRepo(workDir: string): Promise<string> {
    if (this.opts.repoPath) {
      if (this.verbose) console.log(`prefix: using local repo at ${this.opts.repoPath}`)
      return this.opts.repoPath
    }

    const repoDir = path.join(workDir, 'penguins-eggs-prefix')

    if (fs.existsSync(path.join(repoDir, '.git'))) {
      if (this.verbose) console.log('prefix: updating repo...')
      await this.exec(`git -C "${repoDir}" pull --ff-only`, { echo: this.verbose })
    } else {
      if (this.verbose) console.log(`prefix: cloning ${REPO_URL}...`)
      await this.exec(`git clone --depth=1 "${REPO_URL}" "${repoDir}"`, { echo: this.verbose })
    }

    return repoDir
  }

  /**
   * Run build.sh for the configured distro/arch/release.
   * Returns the PrefixResult with tarball path and metadata.
   */
  async build(workDir: string): Promise<PrefixResult> {
    const repoDir = await this.ensureRepo(workDir)
    const outputDir = this.outputDir
    fs.mkdirSync(outputDir, { recursive: true })

    console.log(`prefix: building ${this.distro}/${this.release}/${this.arch}...`)

    const args: string[] = [
      '--distro',  this.distro,
      '--release', this.release,
      '--arch',    this.arch,
      '--output',  outputDir,
      '--jobs',    String(this.jobs),
    ]

    if (this.opts.stage3Tarball)     args.push('--stage3',  this.opts.stage3Tarball)
    if (this.opts.basePrefixTarball) args.push('--prefix',  this.opts.basePrefixTarball)
    if (this.opts.buildIso)          args.push('--iso')

    const cmd = `sudo "${repoDir}/build.sh" ${args.join(' ')}`
    const result = await this.exec(cmd, { echo: this.verbose })
    if (result.code !== 0) {
      throw new Error(
        `prefix build failed (exit ${result.code}):\n${result.error ?? result.data}`
      )
    }

    return this._findTarball(outputDir)
  }

  /** Find the most recently produced tarball for this distro/arch. */
  private _findTarball(outputDir: string): PrefixResult {
    const filePrefix = `penguins_eggs_prefix_${this.distro}_${this.arch}_`
    const files = fs.readdirSync(outputDir)
      .filter(f => f.startsWith(filePrefix) && f.endsWith('.tar.gz'))
      .sort()
      .reverse()

    if (files.length === 0) {
      throw new Error(
        `No prefix tarball found in ${outputDir} matching ${filePrefix}*.tar.gz`
      )
    }

    const tarball = files[0]
    const tarballPath = path.join(outputDir, tarball)
    const sha256Path  = `${tarballPath}.sha256`

    // Check for ISO (same basename, .iso extension)
    const isoName = tarball.replace(/\.tar\.gz$/, '.iso')
    const isoPath = path.join(outputDir, isoName)

    return {
      tarballPath,
      sha256Path,
      isoPath: fs.existsSync(isoPath) ? isoPath : undefined,
      distro:  this.distro,
      arch:    this.arch,
      bytes:   fs.statSync(tarballPath).size,
    }
  }
}

/**
 * List all penguins-eggs-prefix tarballs in a directory, sorted newest-first.
 */
export function prefixTarballs(dir: string): PrefixResult[] {
  if (!fs.existsSync(dir)) return []

  const results: PrefixResult[] = []
  const re = /^penguins_eggs_prefix_(\w+)_([^_]+)_(\d{8})\.tar\.gz$/

  for (const file of fs.readdirSync(dir).sort().reverse()) {
    const m = re.exec(file)
    if (!m) continue
    const tarballPath = path.join(dir, file)
    const isoPath = tarballPath.replace(/\.tar\.gz$/, '.iso')
    results.push({
      tarballPath,
      sha256Path: `${tarballPath}.sha256`,
      isoPath: fs.existsSync(isoPath) ? isoPath : undefined,
      distro:  m[1] as PrefixDistro,
      arch:    m[2] as PrefixArch,
      bytes:   fs.statSync(tarballPath).size,
    })
  }

  return results
}

/**
 * Extract a penguins-eggs-prefix tarball to a rootfs directory.
 * Returns the rootfs directory path.
 */
export async function prefixExtract(
  tarballPath: string,
  rootfsDir: string,
  exec: ExecFn,
  verbose = false
): Promise<string> {
  fs.mkdirSync(rootfsDir, { recursive: true })

  if (verbose) console.log(`prefix: extracting ${path.basename(tarballPath)} → ${rootfsDir}`)

  const result = await exec(
    `tar --numeric-owner -xzf "${tarballPath}" -C "${rootfsDir}"`,
    { echo: verbose }
  )
  if (result.code !== 0) {
    throw new Error(`tarball extraction failed: ${result.error ?? result.data}`)
  }

  return rootfsDir
}
