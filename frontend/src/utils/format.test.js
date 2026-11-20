import { describe, expect, it, vi, afterEach } from 'vitest'
import { daysUntil, formatDate, formatMoney, formatNumber } from './format.js'

describe('formatting helpers', () => {
  afterEach(() => vi.useRealTimers())

  it('formats money with two decimal places', () => {
    expect(formatMoney(12.5)).toMatch(/12\.50$/)
    expect(formatMoney(null)).toBe('—')
  })

  it('formats numbers and dates', () => {
    expect(formatNumber(1234)).toMatch(/1[.,]234/)
    expect(formatDate('2026-11-20')).toBe('20 Nov 2026')
    expect(formatDate(null)).toBe('—')
  })

  it('derives overdue and due-soon day counts from a due date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-20T12:00:00Z'))

    expect(daysUntil('2026-11-18')).toBe(-2)
    expect(daysUntil('2026-11-20')).toBe(0)
    expect(daysUntil('2026-11-23')).toBe(3)
    expect(daysUntil(null)).toBeNull()
  })
})
