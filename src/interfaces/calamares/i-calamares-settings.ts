/**
 * ./src/interfaces/i-calamares-settings.ts
 * penguins-eggs-legacy v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */
export interface ISettings {
  branding: string
  'enable-close-button-during-install'?: boolean
  'prompt-install'?: boolean
  sequence: { [phase: string]: string[] }[]
  'show-sidebar'?: boolean
}
