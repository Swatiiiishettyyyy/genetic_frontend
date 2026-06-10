import { api } from '../../../shared/api/client'

type EventType = 'PAGE_VIEW' | 'ERROR' | 'ACTION' | 'PAYMENT_EVENT'

export function logEvent(event_type: EventType, page: string, data?: Record<string, unknown>, user_id?: number) {
  // fire-and-forget
  api.post('/logs', { event_type, page, data, user_id, timestamp: new Date().toISOString() }).catch(() => {})
}
