import { differenceInCalendarDays, format, parseISO } from 'date-fns'

const moneyFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  return moneyFormatter.format(Number(value))
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—'
  return numberFormatter.format(Number(value))
}

export function formatDate(value) {
  if (!value) return '—'
  try {
    return format(parseISO(value), 'dd MMM yyyy')
  } catch {
    return String(value)
  }
}

/** Positive = due in N days, negative = overdue by N days (uses the browser's clock). */
export function daysUntil(value) {
  if (!value) return null
  try {
    return differenceInCalendarDays(parseISO(value), new Date())
  } catch {
    return null
  }
}
