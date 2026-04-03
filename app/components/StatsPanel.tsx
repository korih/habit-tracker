'use client'

import { formatHours } from '@/lib/colors'
import type { HabitStats, Habit } from '@/lib/types'

interface StatsPanelProps {
  stats: HabitStats
  habit: Habit
}

export function StatsPanel({ stats, habit }: StatsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Main stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Total Hours"
          value={formatHours(stats.totalMinutes)}
          color={habit.color}
        />
        <StatCard
          label="Best Streak"
          value={`${stats.bestStreak}d`}
          color={habit.color}
        />
        <StatCard
          label="Current"
          value={`${stats.currentStreak}d`}
          color={habit.color}
        />
      </div>

      {/* Days active */}
      <div className="flex items-center justify-between px-1 text-sm text-[var(--muted)]">
        <span>{stats.daysActive} days active</span>
        {habit.targetMinutes && (
          <span>Target: {habit.targetMinutes}m/session</span>
        )}
      </div>

      {/* Progress toward total hours goal */}
      {habit.targetTotalHours && stats.progressPercent !== null && (
        <div>
          <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
            <span>Progress toward {habit.targetTotalHours}h goal</span>
            <span>{stats.progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.progressPercent}%`,
                backgroundColor: habit.color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-center">
      <div className="text-lg font-bold text-[var(--text)]" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-[var(--muted)] mt-0.5">{label}</div>
    </div>
  )
}
