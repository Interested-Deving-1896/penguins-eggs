/**
 * ./src/classes/pacman.d/void.ts
 * penguins-eggs v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import fs from 'node:fs'

import { exec, shx } from '../../lib/utils.js'
import Utils from '../utils.js'

/**
 * Void Linux package manager backend (xbps)
 * @remarks all the utilities
 */
export default class Void {
  /**
   * Calamares packages for Void Linux.
   * Void ships calamares in the main repo.
   */
  static packs4calamares = [
    'calamares',
  ]

  /**
   * Void: calamaresInstall
   */
  static async calamaresInstall(verbose = false): Promise<void> {
    const echo = Utils.setEcho(verbose)

    try {
      await exec('xbps-install -Syu', echo)
    } catch {
      Utils.error('Void.calamaresInstall(): xbps-install -Syu')
    }

    try {
      const cmd = `xbps-install -y ${this.packs4calamares.join(' ')}`
      await exec(cmd, echo)
    } catch {
      Utils.error('Void.calamaresInstall(): xbps-install calamares')
    }
  }

  /**
   * Void: calamaresPolicies
   */
  static async calamaresPolicies(verbose = false): Promise<void> {
    const echo = Utils.setEcho(verbose)
    const policyFile = '/usr/share/polkit-1/actions/io.calamares.calamares.policy'
    if (fs.existsSync(policyFile)) {
      await exec(`sed -i 's/auth_admin/yes/' ${policyFile}`, echo)
    }
  }

  /**
   * Void: calamaresRemove
   */
  static async calamaresRemove(verbose = true): Promise<boolean> {
    const echo = Utils.setEcho(verbose)
    let removed = false

    try {
      const cmd = `xbps-remove -y ${this.packs4calamares.join(' ')}`
      await exec(cmd, echo)
      removed = true
    } catch {
      Utils.error('Void.calamaresRemove(): xbps-remove calamares')
    }

    if (removed && fs.existsSync('/etc/calamares')) {
      try {
        await exec('rm /etc/calamares -rf', echo)
      } catch {
        Utils.error('Void.calamaresRemove(): rm /etc/calamares -rf')
      }
    }

    return removed
  }

  /**
   * Void: isInstalledWayland
   */
  static isInstalledWayland(): boolean {
    return this.packageIsInstalled('xwayland')
  }

  /**
   * Void: isInstalledXorg
   */
  static isInstalledXorg(): boolean {
    return this.packageIsInstalled('xorg-server')
  }

  /**
   * Void: packageInstall
   * @param packageName package to install
   * @returns true if successful
   */
  static async packageInstall(packageName: string): Promise<boolean> {
    let retVal = false
    if (shx.exec(`xbps-install -y ${packageName}`, { silent: true }).code === 0) {
      retVal = true
    }

    return retVal
  }

  /**
   * Void: packageIsInstalled
   * @param packageName package to check
   * @returns true if installed
   */
  static packageIsInstalled(packageName: string): boolean {
    const cmd = `xbps-query ${packageName}`
    const { code } = shx.exec(cmd, { silent: true })
    return code === 0
  }

  /**
   * Void: packagePacmanAvailable
   * @param packageName package to check availability
   * @returns true if available in repos
   */
  static async packagePacmanAvailable(packageName: string): Promise<boolean> {
    const cmd = `xbps-query -Rs ${packageName}`
    const stdout = shx.exec(cmd, { silent: true }).stdout.trim()
    return stdout.includes(packageName)
  }
}
