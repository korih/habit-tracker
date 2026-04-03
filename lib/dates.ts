import type { DailyAggregate } from './types'

/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
export function getTodayString(): string {
  const d = new Date()
  return toDateString(d)
}

/**
 * Converts a Date to YYYY-MM-DD string in local time.
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Parses a YYYY-MM-DD string to a local Date object.
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Returns an array of YYYY-MM-DD strings for the past N days (inclusive today).
 */
export function getPastDays(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(toDateString(d))
  }
  return dates
}

/**
 * Returns an array of YYYY-MM-DD strings for all days in a given month.
 */
export function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = []
  const date = new Date(year, month - 1, 1)
  while (date.getMonth() === month - 1) {
    days.push(toDateString(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

/**
 * Returns the first day of the week (0=Sun) for a given month.
 */
export function getMonthStartDay(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

/**
 * Computes current and best streaks from daily aggregates.
 * A streak is consecutive calendar days with at least 1 minute logged.
 */
export function computeStreaks(dailyTotals: DailyAggregate[]): {
  currentStreak: number
  bestStreak: number
} {
  if (dailyTotals.length === 0) return { currentStreak: 0, bestStreak: 0 }

  const dateSet = new Set(
    dailyTotals.filter(d => d.minutes > 0).map(d => d.date)
  )

  const today = getTodayString()
  const yesterday = toDateString(new Date(parseDate(today).getTime() - 86400000))

  // Current streak: walk backward from today (or yesterday if today not active)
  let currentStreak = 0
  const startFrom = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null

  if (startFrom) {
    let cursor = parseDate(startFrom)
    while (dateSet.has(toDateString(cursor))) {
      currentStreak++
      cursor = new Date(cursor.getTime() - 86400000)
    }
  }

  // Best streak: scan all active dates sorted ascending
  const sortedDates = Array.from(dateSet).sort()
  let bestStreak = 0
  let streak = 0
  let prev: string | null = null

  for (const dateStr of sortedDates) {
    if (prev === null) {
      streak = 1
    } else {
      const prevMs = parseDate(prev).getTime()
      const currMs = parseDate(dateStr).getTime()
      const diffDays = Math.round((currMs - prevMs) / 86400000)
      streak = diffDays === 1 ? streak + 1 : 1
    }
    if (streak > bestStreak) bestStreak = streak
    prev = dateStr
  }

  return { currentStreak, bestStreak }
}

/**
 * Formats a YYYY-MM-DD string as a human-readable label like "Today", "Yesterday", or "Mar 15".
 */
export function formatDateLabel(dateStr: string): string {
  const today = getTodayString()
  const yesterday = toDateString(new Date(parseDate(today).getTime() - 86400000))
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  const d = parseDate(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Returns the short month name for a month number (1-12).
 */
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })
}
