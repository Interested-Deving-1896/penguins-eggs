/**
 * plugins/build-infra/penguins-eggs-stage3/command-stage3.ts
 *
 * `eggs stage3` CLI command — build a stage3 tarball or naked base ISO
 * for any supported distro/arch combination.
 *
 * Usage:
 *   eggs stage3 --distro debian --release trixie --arch amd64
 *   eggs stage3 --distro alpine --release 3.21   --arch arm64 --naked
 *   eggs stage3 --distro devuan --release excalibur --arch armhf --skip-iso
 */

import { Command, Flags } from '@oclif/core'
import os from 'node:os'
import path from 'node:path'
import { PenguinsEggsStage3, Stage3Distro, Stage3Arch } from './penguins-eggs-stage3.js'

const SUPPORTED_DISTROS: Stage3Distro[] = [
  'debian', 'ubuntu', 'devuan', 'arch', 'fedora',
  'alpine', 'void', 'opensuse', 'gentoo',
]

const SUPPORTED_ARCHES: Stage3Arch[] = [
  'amd64', 'arm64', 'armhf', 'riscv64',
  'ppc64el', 's390x', 'loong64', 'i386',
]

export default class Stage3Command extends Command {
  static description = 'Build a stage3 tarball or naked base ISO for any distro/arch'

  static examples = [
    '<%= config.bin %> stage3 --distro debian --release trixie --arch amd64',
    '<%= config.bin %> stage3 --distro alpine --release 3.21 --arch arm64 --naked',
    '<%= config.bin %> stage3 --distro devuan --release excalibur --arch armhf --skip-iso',
    '<%= config.bin %> stage3 --distro arch --release rolling --arch arm64 --naked --verbose',
  ]

  static flags = {
    distro: Flags.string({
      char: 'd',
      description: `Target distro (${SUPPORTED_DISTROS.join('/')})`,
      default: 'debian',
      options: SUPPORTED_DISTROS,
    }),
    release: Flags.string({
      char: 'r',
      description: 'Distro release (e.g. trixie, noble, rolling, 3.21)',
    }),
    arch: Flags.string({
      char: 'a',
      description: `Target architecture (${SUPPORTED_ARCHES.join('/')})`,
      default: 'amd64',
      options: SUPPORTED_ARCHES,
    }),
    naked: Flags.boolean({
      char: 'n',
      description: 'Produce a naked base ISO (stage3 + eggs install + eggs produce --naked)',
      default: false,
    }),
    'skip-iso': Flags.boolean({
      description: 'With --naked: install eggs but skip ISO production',
      default: false,
    }),
    'eggs-branch': Flags.string({
      description: 'penguins-eggs branch to install into the stage3',
      default: 'all-features',
    }),
    'repo-path': Flags.string({
      description: 'Path to local penguins-eggs-stage3 repo (auto-cloned if not set)',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output directory for tarballs and ISOs',
      default: process.cwd(),
    }),
    jobs: Flags.integer({
      char: 'j',
      description: 'Parallel build jobs',
      default: os.cpus().length,
    }),
    verbose: Flags.boolean({
      char: 'V',
      description: 'Verbose output',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Stage3Command)

    const distro  = flags.distro  as Stage3Distro
    const arch    = flags.arch    as Stage3Arch
    const verbose = flags.verbose

    const stage3 = new PenguinsEggsStage3(
      this._exec.bind(this),
      verbose,
      {
        distro,
        release:     flags.release,
        arch,
        eggsBranch:  flags['eggs-branch'],
        repoPath:    flags['repo-path'],
        outputDir:   flags.output,
        jobs:        flags.jobs,
        skipIso:     flags['skip-iso'],
      }
    )

    // Prerequisites check
    const { ok, missing } = await stage3.checkPrerequisites()
    if (!ok) {
      this.error(
        'Prerequisites not met:\n' +
        missing.map(m => `  - ${m}`).join('\n') + '\n\n' +
        'Install missing tools and run as root (sudo eggs stage3 ...).'
      )
    }

    const workDir = path.join(os.tmpdir(), `eggs-stage3-${distro}-${arch}`)

    if (flags.naked) {
      this.log(`Building ${distro}/${flags.release ?? 'default'}/${arch} naked base image...`)
      const result = await stage3.buildNaked(workDir)
      this.log(`\nBuild complete:`)
      this.log(`  Stage3: ${result.tarballPath}`)
      if (result.isoPath) {
        this.log(`  ISO:    ${result.isoPath}`)
        this.log(`\nBoot the ISO, customize, then run: sudo eggs produce`)
      } else {
        this.log(`  ISO:    not produced (--skip-iso or eggs produce failed)`)
        this.log(`\nExtract the stage3 tarball and run eggs produce manually.`)
      }
    } else {
      this.log(`Building ${distro}/${flags.release ?? 'default'}/${arch} stage3 tarball...`)
      const tarball = await stage3.buildStage3(workDir)
      this.log(`\nStage3 complete: ${tarball}`)
      this.log(`\nTo use as eggs rootfs source:`)
      this.log(`  eggs stage3 --distro ${distro} --arch ${arch} --naked`)
    }
  }

  private async _exec(
    cmd: string,
    opts: { capture?: boolean; echo?: boolean } = {}
  ): Promise<{ code: number; data: string; error?: string }> {
    const { execSync } = await import('node:child_process')
    try {
      if (opts.echo) this.log(`$ ${cmd}`)
      const data = execSync(cmd, { encoding: 'utf8', stdio: opts.capture ? 'pipe' : 'inherit' })
      return { code: 0, data: data ?? '' }
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: string; stderr?: string; message?: string }
      return {
        code: err.status ?? 1,
        data: err.stdout ?? '',
        error: err.stderr ?? err.message ?? String(e),
      }
    }
  }
}
