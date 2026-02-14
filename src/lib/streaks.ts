import { HabitLog } from '@prisma/client'
import { parseISO, startOfDay, differenceInDays, isAfter, isBefore } from 'date-fns'

/**
 * Calculate streak information from habit logs
 * A streak is consecutive days where hours_logged > 0
 */
export function calculateStreaks(logs: HabitLog[]): {
  currentStreak: number
  longestStreak: number
} {
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Sort logs by date descending (most recent first)
  const sortedLogs = [...logs]
    .filter(log => log.hoursLogged > 0)
    .sort((a, b) => {
      const dateA = parseISO(a.date.toISOString())
      const dateB = parseISO(b.date.toISOString())
      return dateB.getTime() - dateA.getTime()
    })

  if (sortedLogs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  const today = startOfDay(new Date())
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let expectedDate = today

  // Calculate current streak
  for (const log of sortedLogs) {
    const logDate = startOfDay(parseISO(log.date.toISOString()))
    const daysDiff = differenceInDays(expectedDate, logDate)

    if (daysDiff === 0) {
      if (currentStreak === 0 || differenceInDays(expectedDate, today) <= 1) {
        currentStreak++
      }
      expectedDate = new Date(logDate)
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else if (daysDiff === 1) {
      currentStreak++
      expectedDate = new Date(logDate)
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else {
      break
    }
  }

  // Calculate longest streak
  if (sortedLogs.length > 0) {
    // Sort by date ascending for longest streak calculation
    const ascendingLogs = [...sortedLogs].sort((a, b) => {
      const dateA = parseISO(a.date.toISOString())
      const dateB = parseISO(b.date.toISOString())
      return dateA.getTime() - dateB.getTime()
    })

    tempStreak = 1
    longestStreak = 1

    for (let i = 1; i < ascendingLogs.length; i++) {
      const prevDate = startOfDay(parseISO(ascendingLogs[i - 1].date.toISOString()))
      const currDate = startOfDay(parseISO(ascendingLogs[i].date.toISOString()))
      const daysDiff = differenceInDays(currDate, prevDate)

      if (daysDiff === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else if (daysDiff > 1) {
        tempStreak = 1
      }
    }
  }

  return { currentStreak, longestStreak }
}

/**
 * Get today's logged hours from a list of logs
 */
export function getTodayHours(logs: HabitLog[]): number {
  const today = startOfDay(new Date())
  const todayLog = logs.find(log => {
    const logDate = startOfDay(parseISO(log.date.toISOString()))
    return logDate.getTime() === today.getTime()
  })
  return todayLog?.hoursLogged ?? 0
}

/**
 * Format date to YYYY-MM-DD for database storage
 */
export function formatDateForDB(date: Date): string {
  return startOfDay(date).toISOString()
}

/**
 * Parse date from database
 */
export function parseDateFromDB(dateString: string | Date): Date {
  if (typeof dateString === 'string') {
    return parseISO(dateString)
  }
  return dateString
}
