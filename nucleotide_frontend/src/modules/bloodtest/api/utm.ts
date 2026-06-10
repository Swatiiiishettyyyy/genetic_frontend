import { api } from '../../../shared/api/client'

export interface UtmTrackPayload {
  fingerprint:   string
  landing_url:   string
  user_id?:      number | null
  utm_source?:   string | null
  utm_medium?:   string | null
  utm_campaign?: string | null
  utm_term?:     string | null
  utm_content?:  string | null
  utm_id?:       string | null
  browser_name?:    string | null
  browser_version?: string | null
  device_type?:     string | null
  os_name?:         string | null
  os_version?:      string | null
  user_agent?:      string | null
  screen_width?:    number | null
  screen_height?:   number | null
  language?:        string | null
  device_brand?:    string | null
  device_model?:    string | null
  time_zone?:       string | null
  timezone_offset_minutes?: number | null
  ua_platform?:     string | null
  ua_platform_version?: string | null
}

export async function trackUtm(payload: UtmTrackPayload): Promise<void> {
  await api.post('/utm-tracking', payload)
}
