/**
 * plugins/distribution/penguins-over-the-air/produce-hook.ts
 *
 * Pre/post hooks for `eggs produce` that integrate penguins-over-the-air.
 *
 * After eggs produces an ISO, this hook:
 *   1. Creates a pota OTA bundle from the ISO
 *   2. Registers the bundle with the configured OTA server
 *   3. Optionally triggers a pota update check on the local system
 *
 * Usage in ovary.d/produce.ts:
 *   import { afterProduce } from '../../lib/integrations/pota-produce-hook.js'
 *   await afterProduce(isoFilename, isoSize, arch, version, exec, verbose)
 *
 * Configuration via /etc/penguins-eggs.d/pota.yaml:
 *   pota:
 *     enabled: true
 *     server_url: "http://your-pota-server:8080"
 *     channel: stable
 *     bundle_output_dir: /var/lib/pota/bundles
 *     register_after_produce: true
 *     check_update_after_produce: false
 */

import { existsSync, readFileSync } from 'node:fs'
import { PotaClient, PotaConfig } from './pota-client.js'

type ExecFn = (cmd: string, opts?: { capture?: boolean; echo?: boolean }) => Promise<{ code: number; data: string; error?: string }>

interface PotaYamlConfig {
  pota?: {
    enabled?: boolean
    server_url?: string
    channel?: string
    bundle_output_dir?: string
    bundle_script?: string
    pota_bin?: string
    register_after_produce?: boolean
    check_update_after_produce?: boolean
    avb_mode?: string
    avb_key?: string
  }
}

function loadPotaConfig(): { enabled: boolean; config: Partial<PotaConfig>; registerAfterProduce: boolean; checkUpdateAfterProduce: boolean } {
  const configPath = '/etc/penguins-eggs.d/pota.yaml'
  const defaults = {
    enabled: false,
    config: {} as Partial<PotaConfig>,
    registerAfterProduce: true,
    checkUpdateAfterProduce: false,
  }

  if (!existsSync(configPath)) return defaults

  try {
    // Minimal YAML parser for simple key: value structure
    const text = readFileSync(configPath, 'utf8')
    const yaml: PotaYamlConfig = parseSimpleYaml(text)
    const pota = yaml.pota ?? {}

    return {
      enabled: pota.enabled ?? false,
      config: {
        serverUrl: pota.server_url ?? '',
        channel: pota.channel ?? 'stable',
        bundleOutputDir: pota.bundle_output_dir ?? '/var/lib/pota/bundles',
        bundleScript: pota.bundle_script ?? '/usr/share/pota/packaging/bundle/bundle.sh',
        potaBin: pota.pota_bin ?? '/usr/bin/pota',
        avbMode: pota.avb_mode ?? 'unlocked',
        avbKey: pota.avb_key ?? '',
      },
      registerAfterProduce: pota.register_after_produce ?? true,
      checkUpdateAfterProduce: pota.check_update_after_produce ?? false,
    }
  } catch (err: any) {
    console.warn(`pota: failed to parse config ${configPath}: ${err.message}`)
    return defaults
  }
}

/**
 * Called after eggs produce completes successfully.
 *
 * @param isoFilename  Filename of the produced ISO (not full path)
 * @param isoPath      Full path to the produced ISO
 * @param arch         Architecture string (amd64, arm64, etc.)
 * @param version      Version/build ID string
 * @param exec         eggs exec helper
 * @param verbose      Verbose output flag
 */
export async function afterProduce(
  isoFilename: string,
  isoPath: string,
  arch: string,
  version: string,
  exec: ExecFn,
  verbose: boolean,
): Promise<void> {
  const { enabled, config, registerAfterProduce, checkUpdateAfterProduce } = loadPotaConfig()

  if (!enabled) {
    if (verbose) console.log('pota: integration disabled (set pota.enabled: true in /etc/penguins-eggs.d/pota.yaml)')
    return
  }

  const client = new PotaClient(config)

  if (!client.isAvailable()) {
    if (verbose) console.log('pota: not installed — skipping OTA bundle creation')
    return
  }

  console.log(`pota: creating OTA bundle from ISO: ${isoFilename}`)

  try {
    const bundle = await client.createBundle(isoPath, version, arch)
    console.log(`pota: bundle created: ${bundle.bundlePath}`)
    console.log(`pota:   version: ${bundle.version}  arch: ${bundle.arch}  size: ${bundle.payloadSize} bytes`)

    if (registerAfterProduce && config.serverUrl) {
      await client.registerBundle(bundle)
    }

    if (checkUpdateAfterProduce) {
      console.log('pota: triggering update check on local system')
      await client.checkForUpdate()
    }
  } catch (err: any) {
    // Non-fatal — OTA bundle failure should not block ISO production
    console.warn(`pota: bundle creation failed (non-fatal): ${err.message}`)
  }
}

/**
 * Called before eggs produce starts.
 * Checks pota engine status and warns if an update is pending.
 */
export async function beforeProduce(exec: ExecFn, verbose: boolean): Promise<void> {
  const { enabled, config } = loadPotaConfig()
  if (!enabled) return

  const client = new PotaClient(config)
  if (!client.isAvailable()) return

  try {
    const status = await client.getStatus()
    if (status && !status.bootConfirmed) {
      console.warn('pota: WARNING — boot not confirmed on current slot. Consider running `pota status` before producing ISO.')
    }
    if (verbose && status) {
      console.log(`pota: engine status — slot: ${status.activeSlot}, version: ${status.version}, channel: ${status.channel}`)
    }
  } catch {
    // Ignore status errors — pre-produce check is advisory only
  }
}

// ── Minimal YAML parser ───────────────────────────────────────────────────────

function parseSimpleYaml(text: string): any {
  const result: any = {}
  const lines = text.split('\n')
  let currentSection: string | null = null
  let currentObj: any = result

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    if (!line || line.startsWith('#')) continue

    // Top-level key (no leading spaces)
    const topMatch = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (topMatch && !line.startsWith(' ')) {
      const [, key, val] = topMatch
      if (val.trim() === '') {
        result[key] = {}
        currentSection = key
        currentObj = result[key]
      } else {
        result[key] = parseYamlValue(val.trim())
        currentSection = null
        currentObj = result
      }
      continue
    }

    // Nested key (2+ spaces indent)
    const nestedMatch = line.match(/^\s+(\w[\w-]*):\s*(.*)$/)
    if (nestedMatch && currentSection) {
      const [, key, val] = nestedMatch
      result[currentSection][key] = parseYamlValue(val.trim())
    }
  }

  return result
}

function parseYamlValue(val: string): any {
  if (val === 'true') return true
  if (val === 'false') return false
  if (val === 'null' || val === '~') return null
  if (/^\d+$/.test(val)) return parseInt(val, 10)
  // Strip quotes
  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  return val
}
