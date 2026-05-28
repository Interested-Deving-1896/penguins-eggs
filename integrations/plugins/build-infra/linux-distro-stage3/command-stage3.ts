/**
 * plugins/build-infra/linux-distro-stage3/command-stage3.ts
 *
 * `eggs stage3` CLI command — build a linux-distro-stage3 tarball for any
 * supported distro/arch combination.
 *
 * Usage:
 *   eggs stage3 --distro debian  --release trixie    --arch amd64
 *   eggs stage3 --distro alpine  --release 3.21      --arch arm64
 *   eggs stage3 --distro void    --release rolling   --arch amd64
 *   eggs stage3 --distro gentoo  --release rolling   --arch riscv64
 *   eggs stage3 --list
 */

import { Command, Flags } from '@oclif/core'
import os from 'node:os'
import path from 'node:path'
import { Stage3Builder, Stage3Distro, Stage3Arch, stage3Tarballs } from './stage3.js'

const SUPPORTED_DISTROS: Stage3Distro[] = [
  'debian', 'ubuntu', 'devuan', 'arch', 'fedora',
  'alpine', 'void', 'opensuse', 'gentoo',
]

const SUPPORTED_ARCHES: Stage3Arch[] = [
  'amd64', 'arm64', 'armhf', 'riscv64',
  'ppc64el', 's390x', 'loong64', 'i386',
]

export default class Stage3Command extends Command {
  static description = 'Build a linux-distro-stage3 tarball for any distro/arch'

  static examples = [
    '<%= config.bin %> stage3 --distro debian --release trixie --arch amd64',
    '<%= config.bin %> stage3 --distro alpine --release 3.21 --arch arm64',
    '<%= config.bin %> stage3 --distro void --release rolling --arch amd64',
    '<%= config.bin %> stage3 --distro gentoo --release rolling --arch riscv64',
    '<%= config.bin %> stage3 --list',
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
    output: Flags.string({
      char: 'o',
      description: 'Output directory for the tarball',
      default: process.cwd(),
    }),
    'repo-path': Flags.string({
      description: 'Path to a local linux-distro-stage3 checkout (auto-cloned if absent)',
    }),
    jobs: Flags.integer({
      char: 'j',
      description: 'Parallel build jobs',
      default: os.cpus().length,
    }),
    list: Flags.boolean({
      char: 'l',
      description: 'List available stage3 tarballs in the output directory',
      default: false,
    }),
    verbose: Flags.boolean({
      char: 'V',
      description: 'Verbose output',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Stage3Command)

    // List mode
    if (flags.list) {
      const tarballs = stage3Tarballs(flags.output)
      if (tarballs.length === 0) {
        this.log(`No stage3 tarballs found in ${flags.output}`)
        return
      }
      this.log(`Stage3 tarballs in ${flags.output}:`)
      for (const t of tarballs) {
        const mib = (t.bytes / 1024 / 1024).toFixed(0)
        this.log(`  ${path.basename(t.tarballPath)}  (${mib} MiB)`)
      }
      return
    }

    const distro  = flags.distro  as Stage3Distro
    const arch    = flags.arch    as Stage3Arch
    const verbose = flags.verbose

    const builder = new Stage3Builder(
      this._exec.bind(this),
      verbose,
      {
        distro,
        release:  flags.release,
        arch,
        repoPath: flags['repo-path'],
        outputDir: flags.output,
        jobs:     flags.jobs,
      }
    )

    // Prerequisites
    const { ok, missing } = await builder.checkPrerequisites()
    if (!ok) {
      this.error(
        'Prerequisites not met:\n' +
        missing.map(m => `  - ${m}`).join('\n') + '\n\n' +
        'Install missing tools and run as root:\n' +
        `  sudo eggs stage3 --distro ${distro} --arch ${arch}`
      )
    }

    const workDir = path.join(os.tmpdir(), `eggs-stage3-${distro}-${arch}`)
    this.log(`Building ${distro}/${flags.release ?? 'default'}/${arch} stage3...`)

    const result = await builder.build(workDir)

    this.log(`\nStage3 complete:`)
    this.log(`  Tarball: ${result.tarballPath}`)
    this.log(`  SHA256:  ${result.sha256Path}`)
    this.log(`  Size:    ${(result.bytes / 1024 / 1024).toFixed(0)} MiB`)
    this.log(`\nUse as eggs produce source:`)
    this.log(`  sudo eggs produce --stage3 --stage3-distro ${distro} --stage3-arch ${arch}`)
  }

  private async _exec(
    cmd: string,
    opts: { capture?: boolean; echo?: boolean } = {}
  ): Promise<{ code: number; data: string; error?: string }> {
    const { execSync } = await import('node:child_process')
    try {
      if (opts.echo) this.log(`$ ${cmd}`)
      const data = execSync(cmd, {
        encoding: 'utf8',
        stdio: opts.capture ? 'pipe' : 'inherit',
      })
      return { code: 0, data: data ?? '' }
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: string; stderr?: string; message?: string }
      return {
        code:  err.status ?? 1,
        data:  err.stdout ?? '',
        error: err.stderr ?? err.message ?? String(e),
      }
    }
  }
}
