'use client'

import { useRouter } from 'next/navigation'
import { MiniHeatmap } from './MiniHeatmap'
import { formatHours } from '@/lib/colors'
import type { HabitWithDailyTotals } from '@/lib/types'

interface HabitCardProps {
  habit: HabitWithDailyTotals
  onLogSession: (habit: HabitWithDailyTotals) => void
}

export function HabitCard({ habit, onLogSession }: HabitCardProps) {
  const router = useRouter()

  return (
    <div
      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 cursor-pointer hover:border-[var(--muted)] transition-all active:scale-[0.99]"
      onClick={() => router.push(`/habits/${habit.id}`)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: habit.color }}
          />
          <h3 className="font-semibold text-[var(--text)] text-sm truncate">{habit.name}</h3>
        </div>
        <button
          onClick={e => {
            e.stopPropagation()
            onLogSession(habit)
          }}
          className="flex-shrink-0 ml-2 px-2.5 py-1 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: habit.color }}
        >
          + Log
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div>
          <span className="font-bold text-[var(--text)] text-lg" style={{ color: habit.color }}>
            {formatHours(habit.stats.totalMinutes)}
          </span>
          <span className="text-[var(--muted)] text-xs ml-1">total</span>
        </div>
        <div className="text-[var(--muted)] text-xs">
          🔥 {habit.stats.currentStreak}d streak
        </div>
        {habit.targetTotalHours && habit.stats.progressPercent !== null && (
          <div className="text-[var(--muted)] text-xs ml-auto">
            {habit.stats.progressPercent}%
          </div>
        )}
      </div>

      {/* Progress bar (if goal set) */}
      {habit.targetTotalHours && habit.stats.progressPercent !== null && (
        <div className="h-1 rounded-full bg-[var(--border)] mb-3 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${habit.stats.progressPercent}%`,
              backgroundColor: habit.color,
            }}
          />
        </div>
      )}

      {/* Mini heatmap */}
      <div className="overflow-hidden">
        <MiniHeatmap dailyTotals={habit.dailyTotals} color={habit.color} days={182} />
      </div>
    </div>
  )
}
