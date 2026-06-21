/**
 * ./src/classe/ovary.d/luks-interactive-crypto-config.ts
 * penguins-eggs v.25.10.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import { select } from '@inquirer/prompts'

import Ovary from '../ovary.js'
import Utils from '../utils.js'

// --- 1. CONSTANT VALUES ---
const CIPHER_OPTIONS = ['aes-xts-plain64', 'serpent-xts-plain64', 'twofish-xts-plain64'] as const
const KEY_SIZE_OPTIONS = [512, 256] as const
const HASH_OPTIONS = ['sha512', 'sha256'] as const
const SECTOR_SIZE_OPTIONS = [4096, 512] as const
const ARGON_MEMORY_OPTIONS = [524_288, 1_048_576, 2_097_152] as const
const ARGON_PARALLEL_OPTIONS = [1, 2, 4, 8] as const
const PBKDF2_ITER_TIME_OPTIONS = [2000, 5000, 10_000] as const

// --- 2. DERIVED TYPES ---
// (We keep these internal, as we only need to export the final interfaces)
type Cipher = (typeof CIPHER_OPTIONS)[number]
type KeySize = (typeof KEY_SIZE_OPTIONS)[number]
type Hash = (typeof HASH_OPTIONS)[number]
type SectorSize = (typeof SECTOR_SIZE_OPTIONS)[number]
type ArgonPbkdf = 'argon2i' | 'argon2id'
type Pbkdf2Pbkdf = 'pbkdf2'
type ArgonMemory = (typeof ARGON_MEMORY_OPTIONS)[number]
type ArgonParallel = (typeof ARGON_PARALLEL_OPTIONS)[number]
type Pbkdf2IterTime = (typeof PBKDF2_ITER_TIME_OPTIONS)[number]

// --- 3. EXPORTED CONFIGURATION INTERFACES ---
// We export these so other modules (like luks-root.ts) can use them.
export interface BaseCryptoConfig {
  cipher: Cipher
  hash: Hash
  'key-size': KeySize
  pbkdf: ArgonPbkdf | Pbkdf2Pbkdf // Added pbkdf here for the build helper
  'sector-size': SectorSize
}
export interface ArgonCryptoConfig extends BaseCryptoConfig {
  pbkdf: ArgonPbkdf
  'pbkdf-memory (KiB)': ArgonMemory
  'pbkdf-parallel (threads)': ArgonParallel
}
export interface Pbkdf2CryptoConfig extends BaseCryptoConfig {
  'iter-time (ms)': Pbkdf2IterTime
  pbkdf: Pbkdf2Pbkdf
}
export type CryptoConfig = ArgonCryptoConfig | Pbkdf2CryptoConfig

// --- 5. EXPORTED MAIN FUNCTION ---

/**
 * Runs the interactive prompt to configure LUKS encryption settings.
 * @returns A Promise that resolves to the CryptoConfig object.
 */
export async function interactiveCryptoConfig(this: Ovary): Promise<CryptoConfig> {
  // Default luksConfig
  const defaultLuksConfig = {
    cipher: 'aes-xts-plain64',
    hash: 'sha256',
    'key-size': 512,
    pbkdf: 'argon2id',
    'pbkdf-memory (KiB)': 524_288,
    'pbkdf-parallel (threads)': 4,
    'sector-size': 512
  } as CryptoConfig

  // Chiedi se usare la configurazione LUKS di default
  const useDefault = await select({
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false }
    ],
    default: true,
    message: 'Use default LUKS configuration?'
  })

  if (useDefault) {
    Utils.warning(`Using default LUKS configuration`)
    return defaultLuksConfig
  }

  // Se l'utente sceglie "No", procediamo con le domande
  const cipher = await select<Cipher>({
    choices: CIPHER_OPTIONS.map(c => ({ name: c, value: c })),
    default: 'aes-xts-plain64',
    message: 'Choose the cipher algorithm:'
  })

  const keySize = await select<KeySize>({
    choices: KEY_SIZE_OPTIONS.map((size) => ({
      name: `${size} bits ${size === 512 ? '(Standard for AES-256/XTS)' : '(Standard for AES-128/XTS)'}`,
      value: size
    })),
    default: 512,
    message: 'Choose the key size:'
  })

  const hash = await select<Hash>({
    choices: HASH_OPTIONS.map(h => ({ name: h, value: h })),
    default: 'sha256',
    message: 'Choose the hash algorithm:'
  })

  const sectorSize = await select<SectorSize>({
    choices: SECTOR_SIZE_OPTIONS.map((size) => ({
      name: `${size} bytes ${size === 4096 ? '(Modern SSDs/NVMe)' : '(Legacy default/Loop devices'}`,
      value: size
    })),
    default: 512,
    message: 'Choose the sector size:'
  })

  const pbkdf = await select<ArgonPbkdf | Pbkdf2Pbkdf>({
    choices: [
      { name: 'argon2id (Recommended, LUKS2 default)', value: 'argon2id' },
      { name: 'argon2i', value: 'argon2i' },
      { name: 'pbkdf2 (LUKS1 standard)', value: 'pbkdf2' }
    ],
    default: 'argon2id',
    message: 'Choose the key derivation function (PBKDF):'
  })

  let argonMemory: ArgonMemory = 524_288
  let argonParallel: ArgonParallel = 4
  let iterTime: Pbkdf2IterTime = 2000

  if (pbkdf === 'argon2id' || pbkdf === 'argon2i') {
    argonMemory = await select<ArgonMemory>({
      choices: ARGON_MEMORY_OPTIONS.map((mem) => ({
        name: `${mem / 1024 / 1024} GiB (${mem} KiB)`,
        value: mem
      })),
      default: 524_288,
      message: 'Choose the memory cost for Argon2 (KiB):'
    })

    argonParallel = await select<ArgonParallel>({
      choices: ARGON_PARALLEL_OPTIONS.map((threads) => ({
        name: `${threads} threads`,
        value: threads
      })),
      default: 4,
      message: 'Choose parallel threads for Argon2:'
    })
  } else if (pbkdf === 'pbkdf2') {
    iterTime = await select<Pbkdf2IterTime>({
      choices: PBKDF2_ITER_TIME_OPTIONS.map((time) => ({
        name: `${time / 1000} seconds (${time} ms)`,
        value: time
      })),
      default: 2000,
      message: 'Choose the iteration time for PBKDF2 (ms):'
    })
  }

  // Costruiamo l'oggetto config finale
  let finalConfig: CryptoConfig

  if (pbkdf === 'pbkdf2') {
    finalConfig = {
      cipher,
      hash,
      'iter-time (ms)': iterTime,
      'key-size': keySize,
      pbkdf: 'pbkdf2',
      'sector-size': sectorSize
    }
  } else {
    finalConfig = {
      cipher,
      hash,
      'key-size': keySize,
      pbkdf, // argon2i or argon2id
      'pbkdf-memory (KiB)': argonMemory,
      'pbkdf-parallel (threads)': argonParallel,
      'sector-size': sectorSize
    }
  }

  if (finalConfig['sector-size'] === 4096) {
    Utils.warning(`in a loop device - regardless of the hardware - the sector_size will be set to 512`)
    finalConfig['sector-size'] = 512
  }

  return finalConfig
}
