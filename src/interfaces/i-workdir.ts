/**
 * ./src/interfaces/i-workdir.ts
 * penguins-eggs-legacy v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

export interface IWorkDir {
  bin: string // default: /home/eggs/mnt/bin/
  lowerdir: string // default: ${bin}.lowerdir
  merged: string // default: ${bin}.merged
  upperdir: string // default: ${bin}.upperdir
  workdir: string // default: ${bin}.workdir
}
