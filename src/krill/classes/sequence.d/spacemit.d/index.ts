/**
 * ./src/krill/sequence.d/spacemit.d/index.ts
 * Punto di accesso per le variazioni SpacemiT X1
 */

import fstab from '../fstab.js'
import bootloader from './bootloader.js'
import mkfs from './mkfs.js'
import partition from './partition.js'

export const Spacemit = {
    bootloader,
    fstab,
    mkfs,
    partition
}
