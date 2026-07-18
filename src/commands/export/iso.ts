/**
 * ./src/commands/export/iso.ts
 * penguins-eggs-legacy v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import { Command, Flags } from '@oclif/core'
import fs from 'node:fs'

import Tools from '../../classes/tools.js'
import Utils from '../../classes/utils.js'
import { exec } from '../../lib/utils.js'

export default class ExportIso extends Command {
  static description = 'export remastered ISO in the destination host'
  static examples = ['eggs export iso', 'eggs export iso --clean']
  static flags = {
    checksum: Flags.boolean({ char: 'C', description: 'export checksums md5 and sha256' }),
    clean: Flags.boolean({ char: 'c', description: 'delete old ISOs before to copy' }),
    help: Flags.help({ char: 'h' }),
    verbose: Flags.boolean({ char: 'v', description: 'verbose' })
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(ExportIso)
    Utils.titles(this.id + ' ' + this.argv)
    Utils.warning(ExportIso.description)

    const Tu = new Tools()
    await Tu.loadSettings()

    const echo = Utils.setEcho(flags.verbose)

    const files: string[] = []
    if (fs.existsSync(Tu.snapshot_dir)) {
      const allFiles = fs.readdirSync(Tu.snapshot_dir)
      const baseName = Tu.snapshot_name
      for (const file of allFiles) {
        if (file.startsWith(baseName)) {
          if (file.endsWith('.iso') || file.endsWith('.img') || (flags.checksum && (file.endsWith('.md5') || file.endsWith('.sha256')))) {
            files.push(Tu.snapshot_dir + file)
          }
        }
      }
    }

    if (files.length === 0) {
      console.log(`No files found matching ${Tu.snapshot_dir}${Tu.snapshot_name}*`)
      return
    }

    const remote = `${Tu.config.remoteUser}@${Tu.config.remoteHost}`
    let cmd = `#!/bin/bash\nset -e\n`
    let sshCmd = `mkdir -p ${Tu.config.remotePathIso}`
    if (flags.clean) {
      sshCmd += ` && rm -f ${Tu.config.remotePathIso}/${Tu.snapshot_name}*`
    }
    cmd += `ssh ${remote} "${sshCmd}"\n`
    cmd += `scp ${files.join(' ')} ${remote}:${Tu.config.remotePathIso}\n`

    if (!flags.verbose) {
      if (flags.clean) {
        console.log(`remove  ${remote}:${Tu.config.remotePathIso}/${Tu.snapshot_name}*`)
      }

      if (flags.checksum) {
        console.log(`export  ${Tu.snapshot_dir}${Tu.snapshot_name}*.md5/sha256 to ${remote}:${Tu.config.remotePathIso}`)
      }

      console.log(`scp     ${files.join(' ')} to ${remote}:${Tu.config.remotePathIso}`)
    }

    await exec(cmd, echo)
  }
}
