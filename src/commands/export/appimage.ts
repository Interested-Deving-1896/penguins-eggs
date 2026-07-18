/**
 * ./src/commands/export/appimage.ts
 * penguins-eggs-legacy v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import { Command, Flags } from '@oclif/core'
import fs from 'node:fs'
import os from 'node:os'

import Distro from '../../classes/distro.js'
import Diversions from '../../classes/diversions.js'
import Tools from '../../classes/tools.js'
import Utils from '../../classes/utils.js'
import { IEggsConfigTools } from '../../interfaces/i-config-tools.js'
import { exec, execSync } from '../../lib/utils.js'

export default class ExportAppimage extends Command {
  static description = 'export penguins-eggs AppImage to the destination host'
  static examples = ['eggs export pkg', 'eggs export pkg --clean', 'eggs export pkg --all']
  static flags = {
    clean: Flags.boolean({ char: 'c', description: 'remove old .AppImage before to copy' }),
    help: Flags.help({ char: 'h' }),
    verbose: Flags.boolean({ char: 'v', description: 'verbose' })
  }
  clean = false
  echo = {}
  Tu = new Tools()
  user = ''
  verbose = false

  /**
   *
   */
  async run(): Promise<void> {
    const { args, flags } = await this.parse(ExportAppimage)
    Utils.titles(this.id + ' ' + this.argv)
    Utils.warning(ExportAppimage.description)

    // Ora servono in più parti
    this.user = os.userInfo().username
    if (this.user === 'root') {
      this.user = (execSync('echo $DOAS_USER') || '').trim()
      if (this.user === '') {
        this.user = (execSync('echo $DOAS_USER') || '').trim()
      }
    }

    this.clean = flags.clean
    this.verbose = flags.verbose
    this.echo = Utils.setEcho(this.verbose)
    await this.Tu.loadSettings()

    const localPath = `/home/${this.user}/penguins-eggs`
    const remotePath = '/eggs/'

    const files: string[] = []
    if (fs.existsSync(localPath)) {
      const allFiles = fs.readdirSync(localPath)
      const regex = /^penguins-eggs(-legacy)?-([0-9.]+)-.*\.AppImage$/
      for (const file of allFiles) {
        if (regex.test(file)) {
          files.push(`${localPath}/${file}`)
        }
      }
    }

    if (files.length === 0) {
      console.log(`No AppImage files found in ${localPath}`)
      return
    }

    const remote = `${this.Tu.config.remoteUser}@${this.Tu.config.remoteHost}`
    let cmd = `#!/bin/bash\nset -e\n`
    let sshCmd = `mkdir -p ${remotePath}`
    if (this.clean) {
      sshCmd += ` && rm -f ${remotePath}/penguins-eggs-*.AppImage`
    }
    cmd += `ssh ${remote} "${sshCmd}"\n`
    cmd += `scp ${files.join(' ')} ${remote}:${remotePath}\n`

    if (!this.verbose) {
      if (this.clean) {
        console.log(`remove: ${remote}:${remotePath}/penguins-eggs-*.AppImage`)
      }

      console.log(`copy: ${files.join(', ')} to ${remote}:${remotePath}`)
    }

    await exec(cmd, this.echo)
  }
}
