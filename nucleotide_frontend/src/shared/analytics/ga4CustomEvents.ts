import type { UserData } from '../auth/authStorage'
import type { MemberProfile } from '../auth/memberService'

export type Ga4CustomEventName =
  | 'top_nav_menu_click'
  | 'home_tab_change'
  | 'genetic_login_explore'
  | 'blood_login_explore'
  | 'footer_link_click'
  | 'social_icon_click'
  | 'subscribe_to_email'

export type Ga4CustomEventParams = Record<string, string | number | boolean | undefined | null>
export type Ga4AnalyticsScope = 'bloodtest'

type AuthSnapshot = {
  isLoggedIn?: boolean
  user?: UserData | null
  currentMember?: MemberProfile | null
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

const USER_KEYS = new Set(['userID', 'leadID', 'userType', 'custType', 'userProfile', 'gender'])
const PRODUCT_KEYS = new Set([
  'testType',
  'testIncluded',
  'testCategory',
  'testCollection',
  'testFor',
  'testTimeSlot',
  'prodName',
  'prodCategory',
  'prodPrice',
  'prodID',
  'prodBrand',
  'prodVarient',
  'prodQuantity',
])

export function compactGa4Params(params: Ga4CustomEventParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Record<string, string | number | boolean>
}

export function cleanGa4String(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export function cleanGa4Number(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

function normalizeGender(gender: unknown): string | undefined {
  const value = cleanGa4String(gender)
  if (!value) return undefined
  const upper = value.toUpperCase()
  if (upper === 'M') return 'Male'
  if (upper === 'F') return 'Female'
  if (upper === 'O') return 'Other'
  return value
}

function normalizeProfile(member: MemberProfile | null | undefined): string | undefined {
  return cleanGa4String(member?.relation) ?? (member ? 'Self' : undefined)
}

export function ga4CustomUserParams(auth: AuthSnapshot): Ga4CustomEventParams {
  const userId = cleanGa4String(auth.user?.id)
  return {
    userID: userId ? `U_${userId}` : undefined,
    userType: auth.isLoggedIn ? 'logged-in' : 'guest',
    custType: auth.user?.is_new_user === true ? 'New' : auth.isLoggedIn ? 'Existing' : undefined,
    userProfile: normalizeProfile(auth.currentMember),
    gender: normalizeGender(auth.currentMember?.gender),
  }
}

export function buildGa4CustomEventPayload(event: string, params: Ga4CustomEventParams): Record<string, unknown> {
  const cleanParams = compactGa4Params(params)
  const product: Ga4CustomEventParams = {}
  const user: Ga4CustomEventParams = {}
  const data: Ga4CustomEventParams = {}

  Object.entries(cleanParams).forEach(([key, value]) => {
    if (PRODUCT_KEYS.has(key)) {
      product[key] = value
    } else if (USER_KEYS.has(key)) {
      user[key] = value
    } else {
      data[key] = value
    }
  })

  return compactGa4Params({
    event,
    product: Object.keys(product).length ? compactGa4Params(product) : undefined,
    user: Object.keys(user).length ? compactGa4Params(user) : undefined,
    data: Object.keys(data).length ? compactGa4Params(data) : undefined,
  } as Ga4CustomEventParams)
}

export function trackGa4CustomEvent(event: Ga4CustomEventName | string, params: Ga4CustomEventParams = {}): void {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(buildGa4CustomEventPayload(event, params))
}

export function shouldTrackGa4(scope?: Ga4AnalyticsScope): boolean {
  return scope === 'bloodtest'
}
