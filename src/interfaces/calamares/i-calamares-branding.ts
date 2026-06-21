/**
 * ./src/interfaces/i-calamares-branding.ts
 * penguins-eggs-legacy v.25.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

export interface IBrandingStrings {
  bootloaderEntryName: string
  knownIssuesUrl: string
  productName: string
  productUrl: string
  releaseNotesUrl: string
  shortProductName: string
  shortVersion: string
  shortVersionedName: string
  supportUrl: string
  version: string
  versionedName: string
}

export interface IBrandingImages {
  productIcon: string
  productLogo: string
  productWelcome: string
}

export interface IBrandingStyle {
  SidebarBackground: string
  sidebarBackground: string
  SidebarBackgroundCurrent: string
  sidebarBackgroundCurrent: string
  SidebarText: string
  sidebarText: string
  SidebarTextCurrent: string
  sidebarTextCurrent: string
}

export interface IBranding {
  componentName: string
  images: IBrandingImages
  slideshow: string
  slideshowAPI: number

  strings: IBrandingStrings
  style: IBrandingStyle
  welcomeStyleCalamares: boolean
}
