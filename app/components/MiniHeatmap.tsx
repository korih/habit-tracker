'use client'

import { useMemo } from 'react'
import { useTheme } from '@/app/providers/ThemeProvider'
import { getIntensityColors, getIntensityLevel, computeP90 } from '@/lib/colors'
import { getPastDays } from '@/lib/dates'
import type { DailyAggregate } from '@/lib/types'

interface MiniHeatmapProps {
  dailyTotals: DailyAggregate[]
  color: string
  days?: number
}

export function MiniHeatmap({ dailyTotals, color, days = 365 }: MiniHeatmapProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { grid, intensityColors } = useMemo(() => {
    const dateMap = new Map(dailyTotals.map(d => [d.date, d.minutes]))
    const allDays = getPastDays(days)
    const allMinutes = dailyTotals.map(d => d.minutes)
    const p90 = computeP90(allMinutes)
    const colors = getIntensityColors(color, isDark)

    // Pad the front so the grid starts on Sunday
    const firstDate = new Date(allDays[0] + 'T00:00:00')
    const startDay = firstDate.getDay() // 0=Sun
    const paddedDays: (string | null)[] = [
      ...Array(startDay).fill(null),
      ...allDays,
    ]

    const cells = paddedDays.map(date => {
      if (!date) return { date: null, color: 'transparent' }
      const minutes = dateMap.get(date) ?? 0
      const level = getIntensityLevel(minutes, p90)
      return { date, minutes, color: colors[level] }
    })

    return { grid: cells, intensityColors: colors }
  }, [dailyTotals, color, isDark, days])

  // Number of columns (weeks)
  const cols = Math.ceil(grid.length / 7)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 10px)`,
        gridTemplateRows: 'repeat(7, 10px)',
        gridAutoFlow: 'column',
        gap: '2px',
      }}
      aria-label="Activity heatmap"
    >
      {grid.map((cell, i) => (
        <div
          key={i}
          style={{ backgroundColor: cell.color }}
          className="rounded-[2px] w-[10px] h-[10px]"
          title={cell.date ? `${cell.date}: ${cell.minutes ?? 0}m` : undefined}
        />
      ))}
    </div>
  )
}
