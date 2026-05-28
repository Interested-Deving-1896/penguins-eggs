/**
 * plugins/build-infra/linux-distro-stage3/stage3.ts
 *
 * linux-distro-stage3 integration for penguins-eggs.
 *
 * linux-distro-stage3 (https://github.com/Interested-Deving-1896/linux-distro-stage3)
 * builds minimal Linux root filesystem tarballs for any distro/arch combination
 * using native distro tooling (debootstrap, pacstrap, dnf, apk, xbps-install,
 * zypper, Gentoo stage3 tarballs). Each tarball includes a kernel image,
 * initramfs tools, and squashfs/xorriso — everything eggs needs to produce an ISO.
 *
 * This module provides:
 *   - Stage3Builder: clone/update the repo and invoke build.sh
 *   - stage3Tarballs(): list available tarballs in a directory
 *   - stage3Extract(): extract a tarball to a rootfs directory
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export type Stage3Distro =
  | 'debian' | 'ubuntu' | 'devuan'
  | 'arch'   | 'fedora' | 'alpine'
  | 'void'   | 'opensuse' | 'gentoo'

export type Stage3Arch =
  | 'amd64'   | 'arm64'  | 'armhf'
  | 'riscv64' | 'ppc64el'| 's390x'
  | 'loong64' | 'i386'

export interface Stage3Options {
  /** Target distro. Default: debian */
  distro?: Stage3Distro
  /** Distro release. Default: trixie (Debian), noble (Ubuntu), excalibur (Devuan), etc. */
  release?: string
  /** Target architecture. Default: amd64 */
  arch?: Stage3Arch
  /** Path to a local linux-distro-stage3 checkout. Auto-cloned if absent. */
  repoPath?: string
  /** Directory to write the tarball to. Default: cwd */
  outputDir?: string
  /** Parallel build jobs. Default: nproc */
  jobs?: number
}

export interface Stage3Result {
  /** Absolute path to the produced tarball */
  tarballPath: string
  /** Absolute path to the sha256 file */
  sha256Path: string
  distro: Stage3Distro
  release: string
  arch: Stage3Arch
  /** Tarball size in bytes */
  bytes: number
}

const REPO_URL = 'https://github.com/Interested-Deving-1896/linux-distro-stage3'

const DEFAULT_RELEASES: Record<Stage3Distro, string> = {
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

export class Stage3Builder {
  private exec: ExecFn
  private verbose: boolean
  private opts: Stage3Options

  constructor(exec: ExecFn, verbose = false, opts: Stage3Options = {}) {
    this.exec = exec
    this.verbose = verbose
    this.opts = opts
  }

  get distro(): Stage3Distro  { return this.opts.distro  ?? 'debian' }
  get release(): string        { return this.opts.release ?? DEFAULT_RELEASES[this.distro] }
  get arch(): Stage3Arch       { return this.opts.arch    ?? 'amd64' }
  get outputDir(): string      { return this.opts.outputDir ?? process.cwd() }
  get jobs(): number           { return this.opts.jobs ?? os.cpus().length }

  /** Verify root access and required host tools. */
  async checkPrerequisites(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = []

    const uid = await this.exec('id -u', { capture: true })
    if (uid.data.trim() !== '0') missing.push('root (run with sudo)')

    for (const tool of ['git', 'curl', 'debootstrap']) {
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

  /** Clone or update the linux-distro-stage3 repo. Returns the repo path. */
  async ensureRepo(workDir: string): Promise<string> {
    if (this.opts.repoPath) {
      if (this.verbose) console.log(`stage3: using local repo at ${this.opts.repoPath}`)
      return this.opts.repoPath
    }

    const repoDir = path.join(workDir, 'linux-distro-stage3')

    if (fs.existsSync(path.join(repoDir, '.git'))) {
      if (this.verbose) console.log('stage3: updating repo...')
      await this.exec(`git -C "${repoDir}" pull --ff-only`, { echo: this.verbose })
    } else {
      if (this.verbose) console.log(`stage3: cloning ${REPO_URL}...`)
      await this.exec(`git clone --depth=1 "${REPO_URL}" "${repoDir}"`, { echo: this.verbose })
    }

    return repoDir
  }

  /**
   * Run build.sh for the configured distro/arch/release.
   * Returns the Stage3Result with tarball path and metadata.
   */
  async build(workDir: string): Promise<Stage3Result> {
    const repoDir = await this.ensureRepo(workDir)
    const outputDir = this.outputDir
    fs.mkdirSync(outputDir, { recursive: true })

    console.log(`stage3: building ${this.distro}/${this.release}/${this.arch}...`)

    const cmd = [
      'sudo', '-E',
      `DISTRO=${this.distro}`,
      `RELEASE=${this.release}`,
      `ARCH=${this.arch}`,
      `JOBS=${this.jobs}`,
      `OUTPUT_DIR=${outputDir}`,
      `${repoDir}/build.sh`,
      '--distro',  this.distro,
      '--release', this.release,
      '--arch',    this.arch,
      '--output',  outputDir,
      '--jobs',    String(this.jobs),
    ].join(' ')

    const result = await this.exec(cmd, { echo: this.verbose })
    if (result.code !== 0) {
      throw new Error(
        `stage3 build failed (exit ${result.code}):\n${result.error ?? result.data}`
      )
    }

    return this._findTarball(outputDir)
  }

  /** Find the most recently produced tarball for this distro/release/arch. */
  private _findTarball(outputDir: string): Stage3Result {
    const prefix = `${this.distro}_stage3_${this.release}_${this.arch}_`
    const files = fs.readdirSync(outputDir)
      .filter(f => f.startsWith(prefix) && f.endsWith('.tar.gz'))
      .sort()
      .reverse()

    if (files.length === 0) {
      throw new Error(
        `No stage3 tarball found in ${outputDir} matching ${prefix}*.tar.gz`
      )
    }

    const tarball = files[0]
    const tarballPath = path.join(outputDir, tarball)
    const sha256Path  = `${tarballPath}.sha256`

    return {
      tarballPath,
      sha256Path,
      distro:  this.distro,
      release: this.release,
      arch:    this.arch,
      bytes:   fs.statSync(tarballPath).size,
    }
  }
}

/**
 * List all stage3 tarballs in a directory, sorted newest-first.
 */
export function stage3Tarballs(dir: string): Stage3Result[] {
  if (!fs.existsSync(dir)) return []

  const results: Stage3Result[] = []
  const re = /^(\w+)_stage3_([^_]+)_([^_]+)_(\d{8})\.tar\.gz$/

  for (const file of fs.readdirSync(dir).sort().reverse()) {
    const m = re.exec(file)
    if (!m) continue
    const tarballPath = path.join(dir, file)
    results.push({
      tarballPath,
      sha256Path: `${tarballPath}.sha256`,
      distro:  m[1] as Stage3Distro,
      release: m[2],
      arch:    m[3] as Stage3Arch,
      bytes:   fs.statSync(tarballPath).size,
    })
  }

  return results
}

/**
 * Extract a stage3 tarball to a rootfs directory.
 * Returns the rootfs directory path.
 */
export async function stage3Extract(
  tarballPath: string,
  rootfsDir: string,
  exec: ExecFn,
  verbose = false
): Promise<string> {
  fs.mkdirSync(rootfsDir, { recursive: true })

  if (verbose) console.log(`stage3: extracting ${path.basename(tarballPath)} → ${rootfsDir}`)

  const result = await exec(
    `tar --numeric-owner -xzf "${tarballPath}" -C "${rootfsDir}"`,
    { echo: verbose }
  )
  if (result.code !== 0) {
    throw new Error(`tarball extraction failed: ${result.error ?? result.data}`)
  }

  return rootfsDir
}
