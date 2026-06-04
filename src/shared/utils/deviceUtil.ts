export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'device-web-unknown'
  const STORAGE_KEY = 'nucleotide_device_id'
  let deviceId = localStorage.getItem(STORAGE_KEY)
  if (!deviceId) {
    deviceId = `device-web-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(STORAGE_KEY, deviceId)
  }
  return deviceId
}

interface UserAgentBrand {
  brand: string
  version: string
}

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    brands?: UserAgentBrand[]
    mobile?: boolean
    platform?: string
    getHighEntropyValues?: (hints: string[]) => Promise<{
      brands?: UserAgentBrand[]
      mobile?: boolean
      platform?: string
      model?: string
      platformVersion?: string
    }>
  }
}

export interface UtmDeviceMetadata {
  browser_name: string | null
  browser_version: string | null
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  os_name: string | null
  os_version: string | null
  user_agent: string | null
  screen_width: number | null
  screen_height: number | null
  language: string | null
  device_brand: string | null
  device_model: string | null
  time_zone: string | null
  timezone_offset_minutes: number | null
  ua_platform: string | null
  ua_platform_version: string | null
}

interface BrandModelInfo {
  deviceBrand: string | null
  deviceModel: string | null
  uaPlatform: string | null
  uaPlatformVersion: string | null
}

function userAgentData(): NavigatorWithUserAgentData['userAgentData'] {
  if (typeof navigator === 'undefined') return undefined
  return (navigator as NavigatorWithUserAgentData).userAgentData
}

function cleanValue(value?: string | null): string | null {
  const trimmed = value?.trim()
  if (!trimmed || trimmed === 'Unknown') return null
  return trimmed
}

function cleanAndroidModel(value: string): string | null {
  return cleanValue(
    value
      .replace(/\s+Build\/.*$/i, '')
      .replace(/\s+wv$/i, '')
      .replace(/[;)]+$/g, '')
  )
}

async function getHighEntropyUserAgentData() {
  const uaData = userAgentData()
  if (!uaData?.getHighEntropyValues) return null
  try {
    return await uaData.getHighEntropyValues(['model', 'platformVersion'])
  } catch {
    return null
  }
}

function browserFromBrands(brands?: UserAgentBrand[]): { browser: string; version: string } | null {
  if (!brands?.length) return null
  const meaningful = brands.filter(b => !/not.a.brand/i.test(b.brand))
  const edge = meaningful.find(b => /edge/i.test(b.brand))
  if (edge) return { browser: 'Edge', version: edge.version || 'Unknown' }
  const chrome = meaningful.find(b => /google chrome/i.test(b.brand))
  if (chrome) return { browser: 'Chrome', version: chrome.version || 'Unknown' }
  const chromium = meaningful.find(b => /chromium/i.test(b.brand))
  if (chromium) return { browser: 'Chromium', version: chromium.version || 'Unknown' }
  const first = meaningful[0]
  return first ? { browser: first.brand, version: first.version || 'Unknown' } : null
}

export const getBrowserInfo = (): { browser: string; version: string } => {
  if (typeof window === 'undefined') return { browser: 'Unknown', version: 'Unknown' }
  const brandBrowser = browserFromBrands(userAgentData()?.brands)
  if (brandBrowser) return brandBrowser
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let version = 'Unknown'
  if (ua.indexOf('Edg') > -1) {
    browser = 'Edge'
    version = ua.match(/Edg\/(\d+)/)?.[1] ?? 'Unknown'
  } else if (ua.indexOf('OPR') > -1 || ua.indexOf('Opera') > -1) {
    browser = 'Opera'
    version = ua.match(/(?:Opera|OPR)\/(\d+)/)?.[1] ?? 'Unknown'
  } else if (ua.indexOf('CriOS') > -1) {
    browser = 'Chrome'
    version = ua.match(/CriOS\/(\d+)/)?.[1] ?? 'Unknown'
  } else if (ua.indexOf('FxiOS') > -1) {
    browser = 'Firefox'
    version = ua.match(/FxiOS\/(\d+)/)?.[1] ?? 'Unknown'
  } else if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome'
    version = ua.match(/Chrome\/(\d+)/)?.[1] ?? 'Unknown'
  } else if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox'
    version = ua.match(/Firefox\/(\d+)/)?.[1] ?? 'Unknown'
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browser = 'Safari'
    version = ua.match(/Version\/(\d+)/)?.[1] ?? 'Unknown'
  }
  return { browser, version }
}

function getOperatingSystem(): { osName: string; osVersion: string } {
  if (typeof window === 'undefined') return { osName: 'Unknown', osVersion: 'Unknown' }
  const ua = navigator.userAgent
  const platform = userAgentData()?.platform || navigator.platform || ''
  const maxTouchPoints = navigator.maxTouchPoints || 0

  if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1)) {
    return {
      osName: 'iOS',
      osVersion: ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? 'Unknown',
    }
  }
  if (/Android/.test(ua)) {
    return {
      osName: 'Android',
      osVersion: ua.match(/Android ([\d.]+)/)?.[1] ?? 'Unknown',
    }
  }
  if (/CrOS/.test(ua)) {
    return {
      osName: 'ChromeOS',
      osVersion: ua.match(/CrOS [^ ]+ ([\d.]+)/)?.[1] ?? 'Unknown',
    }
  }
  if (/Win/.test(platform) || /Windows/.test(ua)) {
    return {
      osName: 'Windows',
      osVersion: ua.match(/Windows NT ([\d.]+)/)?.[1] ?? 'Unknown',
    }
  }
  if (/Mac/.test(platform) || /Mac OS X/.test(ua)) {
    return {
      osName: 'macOS',
      osVersion: ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? 'Unknown',
    }
  }
  if (/Linux/.test(platform) || /Linux/.test(ua)) {
    return { osName: 'Linux', osVersion: 'Unknown' }
  }
  return { osName: 'Unknown', osVersion: 'Unknown' }
}

function getDeviceType(): UtmDeviceMetadata['device_type'] {
  if (typeof window === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  const platform = navigator.platform || ''
  const uaData = userAgentData()
  const maxTouchPoints = navigator.maxTouchPoints || 0
  const minScreenSide = Math.min(window.screen.width || 0, window.screen.height || 0)

  if (/iPad|Tablet|Kindle|Silk/.test(ua)) return 'tablet'
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return 'tablet'
  if (platform === 'MacIntel' && maxTouchPoints > 1) return 'tablet'
  if (uaData?.mobile || /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile'
  if (maxTouchPoints > 1 && minScreenSide >= 768) return 'tablet'
  return 'desktop'
}

function inferBrandModel(highEntropyModel?: string | null, uaPlatform?: string | null, uaPlatformVersion?: string | null): BrandModelInfo {
  if (typeof window === 'undefined') {
    return { deviceBrand: null, deviceModel: null, uaPlatform: null, uaPlatformVersion: null }
  }
  const ua = navigator.userAgent
  const platform = uaPlatform || userAgentData()?.platform || navigator.platform || ''
  const modelFromHints = cleanValue(highEntropyModel)
  let deviceBrand: string | null = null
  let deviceModel: string | null = modelFromHints

  if (/iPad/.test(ua) || (platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1)) {
    deviceBrand = 'Apple'
    deviceModel = deviceModel || 'iPad'
  } else if (/iPhone|iPod/.test(ua)) {
    deviceBrand = 'Apple'
    deviceModel = deviceModel || 'iPhone'
  } else if (/Mac/.test(platform) || /Mac OS X/.test(ua)) {
    deviceBrand = 'Apple'
    deviceModel = deviceModel || 'Mac'
  } else if (/Android/.test(ua)) {
    const androidModel = cleanAndroidModel(ua.match(/Android [^;]+;\s*([^;)]+)/i)?.[1] ?? '')
    deviceModel = deviceModel || androidModel
    const brandSource = `${deviceModel ?? ''} ${ua}`
    if (/Pixel/i.test(brandSource)) {
      deviceBrand = 'Google'
    } else if (/\bSM-|Samsung|SAMSUNG/i.test(brandSource)) {
      deviceBrand = 'Samsung'
    }
  }

  return {
    deviceBrand,
    deviceModel,
    uaPlatform: cleanValue(platform),
    uaPlatformVersion: cleanValue(uaPlatformVersion),
  }
}

function getTimeZone(): string | null {
  try {
    return cleanValue(Intl.DateTimeFormat().resolvedOptions().timeZone)
  } catch {
    return null
  }
}

export const getUtmDeviceMetadata = async (): Promise<UtmDeviceMetadata> => {
  if (typeof window === 'undefined') {
    return {
      browser_name: null,
      browser_version: null,
      device_type: 'unknown',
      os_name: null,
      os_version: null,
      user_agent: null,
      screen_width: null,
      screen_height: null,
      language: null,
      device_brand: null,
      device_model: null,
      time_zone: null,
      timezone_offset_minutes: null,
      ua_platform: null,
      ua_platform_version: null,
    }
  }
  const highEntropy = await getHighEntropyUserAgentData()
  const brandModel = inferBrandModel(highEntropy?.model, highEntropy?.platform, highEntropy?.platformVersion)
  const { browser, version } = getBrowserInfo()
  const { osName, osVersion } = getOperatingSystem()
  return {
    browser_name: browser === 'Unknown' ? null : browser,
    browser_version: version === 'Unknown' ? null : version,
    device_type: getDeviceType(),
    os_name: osName === 'Unknown' ? null : osName,
    os_version: osVersion === 'Unknown' ? null : osVersion,
    user_agent: navigator.userAgent || null,
    screen_width: Number.isFinite(window.screen.width) ? window.screen.width : null,
    screen_height: Number.isFinite(window.screen.height) ? window.screen.height : null,
    language: navigator.language || null,
    device_brand: brandModel.deviceBrand,
    device_model: brandModel.deviceModel,
    time_zone: getTimeZone(),
    timezone_offset_minutes: Number.isFinite(new Date().getTimezoneOffset())
      ? new Date().getTimezoneOffset()
      : null,
    ua_platform: brandModel.uaPlatform,
    ua_platform_version: brandModel.uaPlatformVersion,
  }
}

export const getDeviceDetails = (): string => {
  if (typeof window === 'undefined') return JSON.stringify({ browser: 'Unknown', version: 'Unknown' })
  const { browser, version } = getBrowserInfo()
  return JSON.stringify({
    browser,
    version,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  })
}

/**
 * IMPORTANT:
 * Our backend supports two auth modes:
 * - Web mode (cookies): device_platform "web" -> tokens in HttpOnly cookies
 * - Mobile mode (bearer): any non-web value -> tokens returned in JSON (access+refresh)
 *
 * In production, the frontend is often hosted on a different origin than the API, and
 * browsers may block third-party cookies. Using bearer tokens avoids refresh failures.
 */
export const getDevicePlatform = (): string => 'mobile_web'
