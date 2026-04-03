'use client'

import { useMemo } from 'react'
import { useTheme } from '@/app/providers/ThemeProvider'
import { getIntensityColors, getIntensityLevel, computeP90, formatMinutes } from '@/lib/colors'
import { getDaysInMonth, getMonthStartDay, getMonthName } from '@/lib/dates'
import type { DailyAggregate } from '@/lib/types'

interface FullCalendarProps {
  year: number
  month: number
  dailyTotals: DailyAggregate[]
  color: string
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function FullCalendar({
  year,
  month,
  dailyTotals,
  color,
  onDayClick,
  selectedDate,
}: FullCalendarProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { days, startDay, dateMap, intensityColors, p90 } = useMemo(() => {
    const days = getDaysInMonth(year, month)
    const startDay = getMonthStartDay(year, month)
    const dateMap = new Map(dailyTotals.map(d => [d.date, d.minutes]))
    const allMinutes = dailyTotals.map(d => d.minutes)
    const p90 = computeP90(allMinutes)
    const intensityColors = getIntensityColors(color, isDark)
    return { days, startDay, dateMap, intensityColors, p90 }
  }, [year, month, dailyTotals, color, isDark])

  const today = new Date().toISOString().slice(0, 10)

  // Build grid cells: empty cells for padding, then day cells
  const cells: (string | null)[] = [...Array(startDay).fill(null), ...days]

  return (
    <div>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs text-[var(--muted)] py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} />
          }

          const minutes = dateMap.get(date) ?? 0
          const level = getIntensityLevel(minutes, p90)
          const bgColor = intensityColors[level]
          const isToday = date === today
          const isSelected = date === selectedDate

          return (
            <button
              key={date}
              onClick={() => onDayClick?.(date)}
              title={minutes > 0 ? `${formatMinutes(minutes)} logged` : 'No activity'}
              className={[
                'aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all',
                onDayClick ? 'cursor-pointer hover:opacity-90 hover:scale-105' : 'cursor-default',
                isToday ? 'ring-2 ring-offset-1 ring-offset-[var(--bg)]' : '',
                isSelected ? 'ring-2' : '',
                minutes > 0 ? 'text-white' : 'text-[var(--muted)]',
              ].join(' ')}
              style={{
                backgroundColor: bgColor,
                outlineColor: (isToday || isSelected) ? color : undefined,
              }}
            >
              {new Date(date + 'T00:00:00').getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
