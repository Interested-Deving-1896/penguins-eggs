/**
 * ./src/commands/update.ts
 * penguins-eggs-legacy v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import { select } from '@inquirer/prompts'
import { Command, Flags } from '@oclif/core'
import axios from 'axios'
import https from 'node:https'

import Distro from '../classes/distro.js'
import Diversions from '../classes/diversions.js'
import Tools from '../classes/tools.js'
import Utils from '../classes/utils.js'
import { exec } from '../lib/utils.js'
const agent = new https.Agent({
  rejectUnauthorized: false
})

/**
 *
 */
export default class Update extends Command {
  static description = "update the Penguins' eggs tool"
  static examples = ['eggs update']
  static flags = {
    help: Flags.help({ char: 'h' }),
    verbose: Flags.boolean({ char: 'v', description: 'verbose' })
  }
  distro = new Distro()

  /**
   *
   */
  async choosePkg(): Promise<string> {
    const choices = [
      { name: 'Abort', value: 'Abort' },
      { name: 'LAN', value: 'LAN' },
      { name: 'Internet', value: 'Internet' },
      { name: 'Source', value: 'Source' },
    ]

    const selected = await select({
      choices,
      message: 'Select update method',
    })

    if (selected === 'Abort') {
      process.exit(0)
    }

    return selected
  }

  async chooseUpdate() {
    console.log()
    const choose = await this.choosePkg()
    Utils.titles(`updating via ${choose}`)
    switch (choose) {
      case 'Internet': {
        await this.getPkgFromPackageManager()

        break
      }

      case 'LAN': {
        await this.getPkgFromLan()

        break
      }

      case 'Source': {
        this.getFromSource()

        break
      }
      // No default
    }
  }

  /**
   *
   */
  getFromSource() {
    console.log('Use the following commands to use penguins-eggs from source:')
    console.log('')
    console.log('cd ~')
    console.log('git clone https://github.com/pieroproietti/penguins-eggs')
    console.log('cd penguins-eggs')
    console.log('pnpm install')
    console.log('pnpm build')
    console.log('./eggs')
    console.log('')
    console.log('NOTE: requires nodejs>18 and pnpm installed')
  }

  /**
   * download da LAN
   */
  async getPkgFromLan() {
    const Tu = new Tools()
    await Tu.loadSettings()

    Utils.warning('Update penguins-eggs from LAN')
    let filter = ''
    let copy = ''
    let install = ''
    let repo = ''

    /**
     * Alpine
     */
    switch (this.distro.familyId) {
      case 'alpine': {
        repo = `alpine/x86_64`
        filter = `penguins-eggs-*-*.*.?-r?.apk`
        copy = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/${repo}/${filter} /tmp`
        install = `apk add /tmp/${filter}`

        /**
         * Arch
         */

        break
      }

      case 'archlinux': {
        repo = 'aur'
        filter = `penguins-eggs-??.*.*-?-any.pkg.tar.zst`
        if (Diversions.isManjaroBased(this.distro.distroId)) {
          repo = 'manjaro'
          filter = `penguins-eggs-??.*.*-?-any.pkg.tar.*`
        }

        copy = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/${repo}/${filter} /tmp`
        install = `pacman -U /tmp/${filter}`

        /**
         * Devuan/Debian/Ubuntu
         */

        break
      }

      case 'debian': {
        repo = 'debs'
        filter = `penguins-eggs_??.*.*-?_${Utils.uefiArch()}.deb`
        copy = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/${repo}/${filter} /tmp`
        install = `apt reinstall /tmp/${filter}`

        /**
         * fedora/el9
         */

        break
      }

      case 'fedora': {
        repo = 'fedora'
        let ftype = 'fc??'
        if (this.distro.distroId !== 'Fedora') {
          repo = 'el9'
          ftype = 'el?'
        }

        filter = `penguins-eggs-??.*.*-?.${ftype}.x86_64.rpm`
        copy = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/${repo}/${filter} /tmp`
        install = `dnf reinstall /tmp/${filter} || dnf install /tmp/${filter}`

        /**
         * openmamba
         */

        break
      }

      case 'openmamba': {
        repo = 'openmamba'
        filter = `penguins-eggs-??.*.*-?mamba.x86_64.rpm`
        copy = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/${repo}/${filter} /tmp`
        install = `dnf reinstall /tmp/${filter} || dnf install /tmp/${filter}`

        /**
         * opensuse
         */

        break
      }

      case 'opensuse': {
        repo = 'opensuse'
        filter = `penguins-eggs-*.*.*-?.opensuse.x86_64.rpm`
        copy = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/${repo}/${filter} /tmp`
        install = `zypper install --force /tmp/${filter} || zypper install /tmp/${filter}`

        break
      }
      // No default
    }

    /**
     * copy and install
     */
    if (await Utils.customConfirm(`Want to update/reinstall penguins-eggs`)) {
      await exec(copy, { capture: true, echo: true })
      await exec(install)
    }
  }

  /**
   *
   */
  async getPkgFromPackageManager() {
    Utils.titles(`update from package Manager`)
    let cmd = ''
    switch (this.distro.familyId) {
      case 'alpine': {
        cmd = `doas apk add penguins-egga`

        break
      }

      case 'archlinux': {
        cmd = 'sudo pacman -S penguins-eggs'

        break
      }

      case 'debian': {
        cmd = 'sudo apt install penguins-eggs\nsudo apt reinstall penguins-eggs'

        break
      }

      case 'fedora': {
        cmd = 'sudo dnf install penguins-eggs\nsudo dnf reinstall penguins-eggs'

        break
      }

      case 'openmamba': {
        cmd = 'sudo dnf install penguins-eggs\nsudo dnf reinstall penguins-eggs'

        break
      }

      case 'opensuse': {
        cmd = String.raw`sudo zypper install penguins-eggs\zypper install --force penguins-eggs`

        break
      }
      // No default
    }

    Utils.warning(`To install/update penguins-eggs cut and copy one of the follow commands`)
    console.log()
    console.log(cmd)
    console.log()
  }

  /**
   * run
   */
  async run(): Promise<void> {
    Utils.titles(this.id + ' ' + this.argv)
    const { flags } = await this.parse(Update)
    Utils.titles(this.id + ' ' + this.argv)

    if (Utils.isRoot()) {
      if (Utils.isSources()) {
        Utils.warning(`You are on penguins-eggs-legacy v. ${Utils.getPackageVersion()} from sources`)
      } else if (Utils.isPackage()) {
        Utils.warning(`You are on eggs-${Utils.getPackageVersion()} installed as package`)
      }

      await this.chooseUpdate()
    } else {
      Utils.useRoot(this.id)
    }
  }

  /**
   * show
   */
  async show(url: string) {
    url += `/stats/json`
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    // adjust 0 before single digit date
    const day = ('0' + yesterday.getDate()).slice(-2)
    const month = ('0' + (yesterday.getMonth() + 1)).slice(-2)
    const year = yesterday.getFullYear()

    const end = year + '-' + month + '-' + day
    const start = year + '-' + month + '-' + day

    const request = '?start_date=' + start + '&end_date=' + end
    url += request

    const res = await axios.get(url, { httpsAgent: agent })
    console.log('\nStatistics to get an idea: yesterday downloads')
    console.log()
    for (const country of res.data.countries) {
      console.log('- ' + country[0] + ': ' + country[1])
    }
  }
}
