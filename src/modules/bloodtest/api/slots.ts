import { api } from '../../../shared/api/client'

export interface SlotDay {
  date: string        // YYYY-MM-DD
  label: string       // e.g. "Sat, 8 Feb"
  slots: SlotTime[]
}

export interface SlotTime {
  start_time: string  // e.g. "09:00"
  end_time: string    // e.g. "11:00"
  label: string       // e.g. "9:00 AM - 11:00 AM"
  internal_mapped_time_slot?: string
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export interface SlotSearchExtras {
  pincode?: string
  thyrocare_product_id?: number
  order_number?: string
}

export async function searchSlots(
  groupId: string,
  dateFrom?: string,
  dateTo?: string,
  extras?: SlotSearchExtras,
): Promise<SlotDay[]> {
  const today = new Date()
  const from = dateFrom ?? toLocalDateStr(today)
  const to = dateTo ?? toLocalDateStr(new Date(today.getTime() + 6 * 86400000))

  const body: Record<string, unknown> = {
    group_id: groupId,
    date_from: from,
    date_to: to,
  }
  if (extras?.pincode) body.pincode = extras.pincode
  if (extras?.thyrocare_product_id != null) body.thyrocare_product_id = extras.thyrocare_product_id
  if (extras?.order_number) body.order_number = extras.order_number

  const res = await api.post<any>('/thyrocare/slots/search', body)

  // Normalize response — API may return various shapes
  let raw: any[] = []
  if (Array.isArray(res)) raw = res
  else if (Array.isArray(res?.data)) raw = res.data
  else if (Array.isArray(res?.data?.days)) raw = res.data.days
  else if (Array.isArray(res?.days)) raw = res.days
  else if (Array.isArray(res?.slots)) raw = res.slots

  return raw.map((day: any) => {
    const dateStr: string = day.date ?? day.appointment_date ?? ''
    const d = new Date(dateStr)
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    const rawSlots = day.slots ?? day.available_slots ?? day.time_slots ?? []
    const slots: SlotTime[] = rawSlots.map((s: any) => {
      // API returns camelCase: startTime/endTime
      const start = s.startTime ?? s.start_time ?? s.start ?? ''
      const end = s.endTime ?? s.end_time ?? s.end ?? ''
      return {
        start_time: start,
        end_time: end,
        label: formatSlotLabel(start, end),
      }
    })
    return { date: dateStr, label, slots: mapThyrocareSlotsToHourlySlots(slots) }
  })
}

// POST /thyrocare/cart/set-appointment
export async function setAppointment(
  groupId: string,
  appointmentDate: string,
  appointmentStartTime: string,
  appointmentTimeHourly?: string,
  internalMappedTimeSlot?: string,
): Promise<void> {
  await api.post('/thyrocare/cart/set-appointment', {
    group_id: groupId,
    appointment_date: appointmentDate,
    appointment_start_time: appointmentStartTime,
    appointment_time_hourly: appointmentTimeHourly,
    internal_mapped_time_slot: internalMappedTimeSlot,
  })
}

function formatSlotLabel(start: string, end: string): string {
  return `${to12h(start)} - ${to12h(end)}`
}

function to12h(time: string): string {
  if (!time) return time
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

const HOURLY_SLOT_MAP: Array<{ internalStart: string; displayStart: string; displayEnd: string }> = [
  { internalStart: '06:00', displayStart: '06:00', displayEnd: '07:00' },
  { internalStart: '07:00', displayStart: '07:00', displayEnd: '08:00' },
  { internalStart: '08:00', displayStart: '08:00', displayEnd: '09:00' },
  { internalStart: '09:00', displayStart: '09:00', displayEnd: '10:00' },
  { internalStart: '10:00', displayStart: '10:00', displayEnd: '11:00' },
  { internalStart: '11:30', displayStart: '11:00', displayEnd: '12:00' },
  { internalStart: '12:00', displayStart: '12:00', displayEnd: '13:00' },
  { internalStart: '13:00', displayStart: '13:00', displayEnd: '14:00' },
]

function normalizeTime(value: string): string {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const match12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (match12) {
    let hour = Number(match12[1])
    const minute = match12[2]
    const ampm = match12[3].toUpperCase()
    if (ampm === 'PM' && hour !== 12) hour += 12
    if (ampm === 'AM' && hour === 12) hour = 0
    return `${String(hour).padStart(2, '0')}:${minute}`
  }
  const match24 = raw.match(/^(\d{1,2}):(\d{2})/)
  if (!match24) return raw
  return `${String(Number(match24[1])).padStart(2, '0')}:${match24[2]}`
}

function mapThyrocareSlotsToHourlySlots(slots: SlotTime[]): SlotTime[] {
  const byStart = new Map(slots.map(slot => [normalizeTime(slot.start_time), slot]))
  return HOURLY_SLOT_MAP
    .map(mapping => {
      const internalSlot = byStart.get(mapping.internalStart)
      if (!internalSlot) return null
      return {
        ...internalSlot,
        start_time: normalizeTime(internalSlot.start_time),
        end_time: normalizeTime(internalSlot.end_time),
        label: formatSlotLabel(mapping.displayStart, mapping.displayEnd),
        internal_mapped_time_slot: internalSlot.label,
      }
    })
    .filter((slot): slot is SlotTime => slot != null)
}
