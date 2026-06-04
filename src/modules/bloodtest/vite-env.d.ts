/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public Google Maps key (HTTP referrer restricted) for map, address search, and reverse geocoding. */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  readonly VITE_API_BASE_URL?: string
}
