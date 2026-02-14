import { Habit, HabitLog } from '@prisma/client'

export type HabitWithLogs = Habit & {
  logs: HabitLog[]
}

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
}

export interface DashboardHabit {
  id: number
  name: string
  color: string
  dailyGoalHours: number
  todayHours: number
  currentStreak: number
}

export interface CalendarDay {
  date: Date
  hours: number
  isCurrentMonth: boolean
}
