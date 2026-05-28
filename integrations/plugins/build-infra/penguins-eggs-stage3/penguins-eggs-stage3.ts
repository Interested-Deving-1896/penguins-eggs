/**
 * plugins/build-infra/penguins-eggs-stage3/penguins-eggs-stage3.ts
 *
 * penguins-eggs-stage3 integration for eggs produce.
 *
 * penguins-eggs-stage3 (https://github.com/Interested-Deving-1896/penguins-eggs-stage3)
 * builds minimal Linux root filesystems (stage3 tarballs) for any distro/arch
 * combination, installs penguins-eggs into them, and optionally produces a
 * naked base ISO with `eggs produce --naked`.
 *
 * Two integration modes:
 *
 * 1. BASE ROOTFS MODE: Build a stage3 tarball for a target distro/arch and
 *    use it as the rootfs source for eggs produce. Gives eggs a clean,
 *    reproducible starting point without requiring a running installation.
 *
 * 2. NAKED ISO MODE: Run the full build-naked.sh pipeline — stage3 + eggs
 *    install + eggs produce --naked — to produce a bootable minimal ISO for
 *    any distro/arch. The ISO can be booted, customized, and remastered.
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

type ExecFn = (cmd: string, opts?: { capture?: boolean; echo?: boolean }) => Promise<{
  code: number
  data: string
  error?: string
}>

export type Stage3Distro =
  | 'debian' | 'ubuntu' | 'devuan'
  | 'arch' | 'fedora' | 'alpine'
  | 'void' | 'opensuse' | 'gentoo'

export type Stage3Arch =
  | 'amd64' | 'arm64' | 'armhf'
  | 'riscv64' | 'ppc64el' | 's390x'
  | 'loong64' | 'i386'

export interface Stage3Config {
  /** Target distro. Default: debian */
  distro?: Stage3Distro
  /** Distro release. Default: trixie (Debian), noble (Ubuntu), excalibur (Devuan), etc. */
  release?: string
  /** Target architecture. Default: host arch (amd64). */
  arch?: Stage3Arch
  /** Path to penguins-eggs-stage3 repo. Auto-cloned if not set. */
  repoPath?: string
  /** penguins-eggs branch to install into the stage3. Default: all-features */
  eggsBranch?: string
  /** penguins-eggs version to install. Default: latest */
  eggsVersion?: string
  /** Working directory for the build. Default: system temp dir. */
  workDir?: string
  /** Output directory for tarballs and ISOs. Default: cwd. */
  outputDir?: string
  /** Skip ISO production — produce stage3 tarball only. Default: false */
  skipIso?: boolean
  /** Parallel jobs for the build. Default: nproc. */
  jobs?: number
}

export interface Stage3Result {
  /** Path to the stage3 tarball. */
  tarballPath: string
  /** Path to the naked ISO (if produced). */
  isoPath?: string
  /** Distro/release/arch of the build. */
  distro: Stage3Distro
  release: string
  arch: Stage3Arch
  /** Size of the tarball in bytes. */
  tarballBytes: number
  /** Size of the ISO in bytes (if produced). */
  isoBytes?: number
}

const STAGE3_REPO = 'https://github.com/Interested-Deving-1896/penguins-eggs-stage3'

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

export class PenguinsEggsStage3 {
  private exec: ExecFn
  private verbose: boolean
  private config: Stage3Config

  constructor(exec: ExecFn, verbose = false, config: Stage3Config = {}) {
    this.exec = exec
    this.verbose = verbose
    this.config = config
  }

  /** Check if the build environment is ready (root + required tools). */
  async checkPrerequisites(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = []

    // Must run as root
    const whoami = await this.exec('id -u', { capture: true })
    if (whoami.data.trim() !== '0') {
      missing.push('root access (run with sudo)')
    }

    // Required tools
    for (const tool of ['debootstrap', 'git', 'curl', 'xz']) {
      const r = await this.exec(`command -v ${tool}`, { capture: true })
      if (r.code !== 0) missing.push(tool)
    }

    // QEMU for cross-arch
    const hostArch = os.arch()
    const targetArch = this.config.arch ?? 'amd64'
    if (hostArch !== 'x64' || targetArch !== 'amd64') {
      const r = await this.exec('command -v qemu-aarch64-static', { capture: true })
      if (r.code !== 0) missing.push('qemu-user-static (for cross-arch builds)')
    }

    return { ok: missing.length === 0, missing }
  }

  /** Clone or update the penguins-eggs-stage3 repo. */
  async ensureRepo(workDir: string): Promise<string> {
    if (this.config.repoPath) {
      if (this.verbose) console.log(`stage3: using existing repo at ${this.config.repoPath}`)
      return this.config.repoPath
    }

    const repoDir = path.join(workDir, 'penguins-eggs-stage3')

    if (fs.existsSync(path.join(repoDir, '.git'))) {
      if (this.verbose) console.log('stage3: updating existing repo...')
      await this.exec(`git -C "${repoDir}" pull --ff-only`, { echo: this.verbose })
    } else {
      if (this.verbose) console.log(`stage3: cloning ${STAGE3_REPO}...`)
      await this.exec(`git clone --depth=1 "${STAGE3_REPO}" "${repoDir}"`, { echo: this.verbose })
    }

    return repoDir
  }

  /**
   * Build a stage3 tarball for the configured distro/arch.
   * Returns the path to the tarball.
   */
  async buildStage3(workDir: string): Promise<string> {
    const repoDir = await this.ensureRepo(workDir)
    const distro   = this.config.distro   ?? 'debian'
    const release  = this.config.release  ?? DEFAULT_RELEASES[distro]
    const arch     = this.config.arch     ?? 'amd64'
    const outputDir = this.config.outputDir ?? process.cwd()
    const jobs     = this.config.jobs     ?? os.cpus().length

    console.log(`stage3: building ${distro}/${release}/${arch} stage3...`)

    const cmd = [
      'sudo', '-E',
      `DISTRO=${distro}`,
      `RELEASE=${release}`,
      `ARCH=${arch}`,
      `JOBS=${jobs}`,
      `${repoDir}/build.sh`,
      '--distro',  distro,
      '--release', release,
      '--arch',    arch,
      '--output',  outputDir,
    ].join(' ')

    const result = await this.exec(cmd, { echo: this.verbose })
    if (result.code !== 0) {
      throw new Error(`stage3 build failed (exit ${result.code}): ${result.error ?? result.data}`)
    }

    // Find the produced tarball
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const tarball = path.join(outputDir, `${distro}_stage3_${release}_${arch}_${date}.tar.gz`)
    if (!fs.existsSync(tarball)) {
      // Try to find it with a glob
      const files = fs.readdirSync(outputDir)
        .filter(f => f.startsWith(`${distro}_stage3_${release}_${arch}_`) && f.endsWith('.tar.gz'))
      if (files.length === 0) throw new Error(`stage3 tarball not found in ${outputDir}`)
      return path.join(outputDir, files[0])
    }
    return tarball
  }

  /**
   * Run the full build-naked.sh pipeline:
   * stage3 → eggs install → eggs produce --naked → ISO
   */
  async buildNaked(workDir: string): Promise<Stage3Result> {
    const repoDir   = await this.ensureRepo(workDir)
    const distro    = this.config.distro   ?? 'debian'
    const release   = this.config.release  ?? DEFAULT_RELEASES[distro]
    const arch      = this.config.arch     ?? 'amd64'
    const outputDir = this.config.outputDir ?? process.cwd()
    const jobs      = this.config.jobs     ?? os.cpus().length
    const skipIso   = this.config.skipIso  ?? false

    console.log(`stage3: building ${distro}/${release}/${arch} naked image...`)

    const env = [
      `DISTRO=${distro}`,
      `RELEASE=${release}`,
      `ARCH=${arch}`,
      `JOBS=${jobs}`,
      `EGGS_BRANCH=${this.config.eggsBranch ?? 'all-features'}`,
      `EGGS_VERSION=${this.config.eggsVersion ?? 'latest'}`,
      `SKIP_ISO=${skipIso ? '1' : '0'}`,
      `OUTPUT_DIR=${outputDir}`,
    ].join(' ')

    const args = [
      '--distro',  distro,
      '--release', release,
      '--arch',    arch,
      '--output',  outputDir,
      ...(skipIso ? ['--skip-iso'] : []),
    ].join(' ')

    const result = await this.exec(
      `sudo -E ${env} ${repoDir}/build-naked.sh ${args}`,
      { echo: this.verbose }
    )
    if (result.code !== 0) {
      throw new Error(`build-naked failed (exit ${result.code}): ${result.error ?? result.data}`)
    }

    // Locate outputs
    const files = fs.readdirSync(outputDir)
    const tarball = files.find(f =>
      f.startsWith(`${distro}_stage3_${release}_${arch}_`) && f.endsWith('.tar.gz')
    )
    const iso = files.find(f =>
      f.startsWith(`${distro}-${release}-${arch}-naked`) && f.endsWith('.iso')
    )

    if (!tarball) throw new Error(`stage3 tarball not found in ${outputDir}`)

    const tarballPath = path.join(outputDir, tarball)
    const isoPath = iso ? path.join(outputDir, iso) : undefined

    return {
      tarballPath,
      isoPath,
      distro,
      release,
      arch,
      tarballBytes: fs.statSync(tarballPath).size,
      isoBytes: isoPath ? fs.statSync(isoPath).size : undefined,
    }
  }

  /**
   * Use a stage3 tarball as the rootfs source for eggs produce.
   * Extracts the tarball to a temp directory and returns the path.
   */
  async prepareRootfs(tarballPath: string, workDir: string): Promise<string> {
    const rootfsDir = path.join(workDir, 'stage3-rootfs')
    fs.mkdirSync(rootfsDir, { recursive: true })

    console.log(`stage3: extracting ${path.basename(tarballPath)} to ${rootfsDir}...`)
    const result = await this.exec(
      `tar --numeric-owner -xzf "${tarballPath}" -C "${rootfsDir}"`,
      { echo: this.verbose }
    )
    if (result.code !== 0) {
      throw new Error(`tarball extraction failed: ${result.error ?? result.data}`)
    }

    return rootfsDir
  }
}
