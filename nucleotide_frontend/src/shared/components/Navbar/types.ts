import type React from 'react'
import type { Ga4AnalyticsScope } from '../../analytics/ga4CustomEvents'

export interface NavLink {
  label: string
  href: string
}

export interface NavbarProps {
  logoSrc: string
  logoAlt: string
  links: NavLink[]
  ctaLabel: string
  onCtaClick?: () => void
  hideSearchOnMobile?: boolean
  activeHrefOverride?: string
  analyticsScope?: Ga4AnalyticsScope
}

export type NavbarComponentProps = NavbarProps & {
  cartCount?: number
  children?: React.ReactNode
}
