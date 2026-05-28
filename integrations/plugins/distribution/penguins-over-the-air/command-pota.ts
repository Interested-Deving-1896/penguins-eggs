/**
 * plugins/distribution/penguins-over-the-air/command-pota.ts
 *
 * `eggs pota` command — penguins-over-the-air OTA management from within eggs.
 *
 * Subcommands:
 *   eggs pota status              Show pota engine and slot state
 *   eggs pota update              Check for and apply an OTA update
 *   eggs pota rollback            Roll back to the previous slot
 *   eggs pota channel get|set|list  Manage update channels
 *   eggs pota bundle              Create an OTA bundle from the last ISO
 *   eggs pota android <cmd>       Android OTA operations (delegates to pota android)
 *
 * This command is registered in eggs' command registry when the pota plugin
 * is enabled. It wraps the `pota` CLI binary.
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const POTA_BIN = process.env['POTA_BIN'] ?? '/usr/bin/pota'
const POTA_FALLBACK = process.env['LOTA_BIN'] ?? '/usr/bin/lota'

function findPota(): string | null {
  if (existsSync(POTA_BIN)) return POTA_BIN
  if (existsSync(POTA_FALLBACK)) return POTA_FALLBACK
  return null
}

/**
 * Run a pota subcommand, forwarding all args and stdio.
 * Returns the exit code.
 */
export function runPota(args: string[]): number {
  const bin = findPota()
  if (!bin) {
    console.error('pota: not installed. Install penguins-over-the-air or linux-over-the-air.')
    return 1
  }

  const result = spawnSync(bin, args, { stdio: 'inherit' })
  return result.status ?? 1
}

/**
 * `eggs pota` command handler.
 * Called by eggs' command dispatcher with the remaining argv.
 */
export function commandPota(argv: string[]): void {
  const subcommand = argv[0] ?? 'status'
  const rest = argv.slice(1)

  switch (subcommand) {
    case 'status':
      process.exit(runPota(['status', ...rest]))

    case 'update':
      process.exit(runPota(['update', ...rest]))

    case 'rollback':
      process.exit(runPota(['rollback', ...rest]))

    case 'channel':
      process.exit(runPota(['channel', ...rest]))

    case 'android':
      process.exit(runPota(['android', ...rest]))

    case 'bundle': {
      // eggs pota bundle [--iso PATH] [--version VER] [--arch ARCH]
      const isoIdx = rest.indexOf('--iso')
      const iso = isoIdx >= 0 ? rest[isoIdx + 1] : findLastIso()
      if (!iso) {
        console.error('pota bundle: no ISO found. Run `eggs produce` first or pass --iso PATH')
        process.exit(1)
      }
      const verIdx = rest.indexOf('--version')
      const version = verIdx >= 0 ? rest[verIdx + 1] : deriveVersion()
      const archIdx = rest.indexOf('--arch')
      const arch = archIdx >= 0 ? rest[archIdx + 1] : detectArch()

      // Delegate to bundle.sh directly
      const bundleScript = '/usr/share/pota/packaging/bundle/bundle.sh'
      if (!existsSync(bundleScript)) {
        console.error(`pota bundle: script not found: ${bundleScript}`)
        process.exit(1)
      }
      const r = spawnSync('bash', [bundleScript, 'create',
        '--version', version,
        '--arch', arch,
        '--payload', iso,
        '--distro', 'debian',
      ], { stdio: 'inherit' })
      process.exit(r.status ?? 1)
    }

    case 'help':
    case '--help':
    case '-h':
      printHelp()
      process.exit(0)

    default:
      console.error(`pota: unknown subcommand: ${subcommand}`)
      printHelp()
      process.exit(1)
  }
}

function printHelp(): void {
  console.log(`
eggs pota — penguins-over-the-air OTA management

Usage:
  eggs pota status              Show engine and slot state
  eggs pota update              Check for and apply an OTA update
  eggs pota rollback            Roll back to the previous slot
  eggs pota channel get         Print active channel
  eggs pota channel set CHAN    Switch channel (stable|beta|dev|lts)
  eggs pota channel list        List available channels
  eggs pota bundle              Create OTA bundle from last produced ISO
  eggs pota android flash       Flash Android device via fastboot
  eggs pota android sideload    Deliver update via ADB sideload
  eggs pota android waydroid    Manage Waydroid container updates
  eggs pota android status      Show Android device slot state
`.trim())
}

function findLastIso(): string | null {
  // Look for the most recently modified ISO in /home/eggs/
  const result = spawnSync('bash', ['-c',
    'ls -t /home/eggs/*.iso 2>/dev/null | head -1'
  ], { encoding: 'utf8' })
  const iso = result.stdout.trim()
  return iso || null
}

function deriveVersion(): string {
  // Try to read eggs version from package.json or /etc/penguins-eggs.d/version
  try {
    const r = spawnSync('eggs', ['--version'], { encoding: 'utf8' })
    const match = r.stdout.match(/[\d]+\.[\d]+\.[\d]+/)
    if (match) return match[0]
  } catch { /* ignore */ }
  return new Date().toISOString().slice(0, 10).replace(/-/g, '.')
}

function detectArch(): string {
  const r = spawnSync('dpkg', ['--print-architecture'], { encoding: 'utf8' })
  return r.stdout.trim() || 'amd64'
}
