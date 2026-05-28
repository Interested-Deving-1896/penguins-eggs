/**
 * plugins/distribution/penguins-over-the-air/pota-client.ts
 *
 * Client interface to penguins-over-the-air (pota) — the Debian-tuned OTA
 * engine forked from linux-over-the-air.
 *
 * Provides:
 *   - Bundle creation from eggs-produced ISOs
 *   - OTA server registration of new bundles
 *   - Channel management (stable/beta/dev/lts)
 *   - Status queries against the pota engine
 */

import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'

export interface PotaConfig {
  /** Path to the pota bundle script */
  bundleScript: string
  /** Path to the pota CLI binary */
  potaBin: string
  /** OTA server URL for bundle registration */
  serverUrl: string
  /** Default channel for new bundles */
  channel: string
  /** Output directory for created bundles */
  bundleOutputDir: string
  /** AVB mode for Android bundles: 'signed' | 'unlocked' */
  avbMode: string
  /** AVB signing key path (required when avbMode = 'signed') */
  avbKey: string
}

export interface BundleResult {
  bundlePath: string
  version: string
  arch: string
  channel: string
  payloadSha256: string
  payloadSize: number
  createdAt: string
}

export interface PotaStatus {
  activeSlot: string
  inactiveSlot: string
  bootConfirmed: boolean
  version: string
  channel: string
  engineRunning: boolean
}

const DEFAULT_CONFIG: PotaConfig = {
  bundleScript: '/usr/share/pota/packaging/bundle/bundle.sh',
  potaBin: '/usr/bin/pota',
  serverUrl: '',
  channel: 'stable',
  bundleOutputDir: '/var/lib/pota/bundles',
  avbMode: 'unlocked',
  avbKey: '',
}

export class PotaClient {
  private config: PotaConfig

  constructor(config: Partial<PotaConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Check whether pota is installed and reachable.
   */
  isAvailable(): boolean {
    return existsSync(this.config.potaBin) || existsSync(this.config.bundleScript)
  }

  /**
   * Create a lota-format bundle from an eggs-produced ISO.
   *
   * @param isoPath   Path to the ISO file produced by eggs
   * @param version   Version string (e.g. "1.2.0" or eggs build ID)
   * @param arch      Architecture string (e.g. "amd64", "arm64")
   */
  async createBundle(isoPath: string, version: string, arch: string): Promise<BundleResult> {
    if (!existsSync(isoPath)) {
      throw new Error(`ISO not found: ${isoPath}`)
    }

    const script = this.config.bundleScript
    if (!existsSync(script)) {
      throw new Error(`pota bundle script not found: ${script}`)
    }

    const args = [
      'create',
      '--version', version,
      '--arch', arch,
      '--payload', isoPath,
      '--channel', this.config.channel,
      '--distro', 'debian',
      '--output', this.config.bundleOutputDir,
    ]

    const result = spawnSync('bash', [script, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    if (result.status !== 0) {
      throw new Error(`Bundle creation failed:\n${result.stderr}`)
    }

    // Read the manifest from the created bundle
    const bundleName = `bundle-${version}-${arch}.lota`
    const bundlePath = join(this.config.bundleOutputDir, bundleName)
    const manifestPath = join(bundlePath, 'manifest.json')

    if (!existsSync(manifestPath)) {
      throw new Error(`Bundle manifest not found: ${manifestPath}`)
    }

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return {
      bundlePath,
      version: manifest.version,
      arch: manifest.arch,
      channel: manifest.channel,
      payloadSha256: manifest.payload_sha256,
      payloadSize: manifest.payload_size,
      createdAt: manifest.created_at,
    }
  }

  /**
   * Register a bundle with the pota OTA server so devices can discover it.
   *
   * @param bundle  Result from createBundle()
   */
  async registerBundle(bundle: BundleResult): Promise<void> {
    if (!this.config.serverUrl) {
      console.warn('pota: no serverUrl configured — skipping bundle registration')
      return
    }

    const manifestPath = join(bundle.bundlePath, 'manifest.json')
    const manifest = readFileSync(manifestPath, 'utf8')

    const response = await fetch(`${this.config.serverUrl}/api/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: manifest,
    })

    if (!response.ok) {
      throw new Error(`Bundle registration failed: HTTP ${response.status}`)
    }

    console.log(`pota: bundle registered: ${bundle.version} (${bundle.arch}) → ${this.config.serverUrl}`)
  }

  /**
   * Query the pota engine status on the local system.
   */
  async getStatus(): Promise<PotaStatus | null> {
    if (!existsSync(this.config.potaBin)) {
      return null
    }

    const result = spawnSync(this.config.potaBin, ['status', '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    if (result.status !== 0) return null

    try {
      return JSON.parse(result.stdout) as PotaStatus
    } catch {
      return null
    }
  }

  /**
   * Trigger a pota update check on the local system.
   */
  async checkForUpdate(): Promise<boolean> {
    if (!existsSync(this.config.potaBin)) {
      return false
    }

    const result = spawnSync(this.config.potaBin, ['update', '--check-only'], {
      encoding: 'utf8',
      stdio: 'inherit',
    })

    return result.status === 0
  }

  /**
   * Switch the active update channel.
   */
  async setChannel(channel: string): Promise<void> {
    if (!existsSync(this.config.potaBin)) {
      throw new Error('pota not installed')
    }

    const result = spawnSync(this.config.potaBin, ['channel', 'set', channel], {
      encoding: 'utf8',
      stdio: 'inherit',
    })

    if (result.status !== 0) {
      throw new Error(`Channel switch failed: ${result.stderr}`)
    }
  }
}
