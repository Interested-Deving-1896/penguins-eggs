import { select } from '@inquirer/prompts'
import * as yaml from 'js-yaml';
import fs from 'node:fs'

import Pacman from '../../classes/pacman.js'
import { IPartitions } from '../../interfaces/index.js'

export default async function selectFileSystemType(): Promise<string> {
  let partitions = {} as IPartitions
  if (fs.existsSync('/etc/calamares/modules/partition.conf')) {
    partitions = yaml.load(fs.readFileSync('/etc/calamares/modules/partition.conf', 'utf8')) as unknown as IPartitions
  } else {
    partitions.defaultFileSystemType = 'ext4'
  }

  const choices = [{ name: 'ext4', value: 'ext4' }]
  if (Pacman.packageIsInstalled('progs') || Pacman.packageIsInstalled('btrfsprogs')) {
    choices.push({ name: 'btrfs', value: 'btrfs' })
  }

  partitions.defaultFileSystemType = 'ext4'

  const answer = await select({
    choices,
    default: partitions.defaultFileSystemType,
    message: 'Select file system type',
  });

  return answer;
}
