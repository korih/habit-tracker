import { computeStreaks } from './dates'
import type { DailyAggregate, HabitStats } from './types'

export function computeStats(
  dailyTotals: DailyAggregate[],
  targetTotalHours: number | null
): HabitStats {
  const totalMinutes = dailyTotals.reduce((sum, d) => sum + d.minutes, 0)
  const daysActive = dailyTotals.filter(d => d.minutes > 0).length
  const { currentStreak, bestStreak } = computeStreaks(dailyTotals)

  const progressPercent =
    targetTotalHours && targetTotalHours > 0
      ? Math.min(100, Math.round((totalMinutes / 60 / targetTotalHours) * 100))
      : null

  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    daysActive,
    currentStreak,
    bestStreak,
    progressPercent,
  }
}
