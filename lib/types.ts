export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  googleId: string
  createdAt: string
  updatedAt: string
}

export interface Habit {
  id: string
  name: string
  color: string
  targetMinutes: number | null
  targetTotalHours: number | null
  archived: boolean
  sortOrder: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  date: string // YYYY-MM-DD
  minutes: number
  note: string | null
  habitId: string
  createdAt: string
  updatedAt: string
}

export interface DailyAggregate {
  date: string
  minutes: number
}

export interface HabitStats {
  totalMinutes: number
  totalHours: number
  daysActive: number
  currentStreak: number
  bestStreak: number
  progressPercent: number | null
}

export interface HabitWithDailyTotals extends Habit {
  dailyTotals: DailyAggregate[]
  stats: HabitStats
}

export interface HabitWithSessions extends Habit {
  sessions: Session[]
  stats: HabitStats
}

export interface CreateHabitInput {
  name?: string
  color?: string
  targetMinutes?: number | null
  targetTotalHours?: number | null
}

export interface UpdateHabitInput {
  name?: string
  color?: string
  targetMinutes?: number | null
  targetTotalHours?: number | null
  archived?: boolean
}

export interface LogSessionInput {
  date: string
  minutes: number
  note?: string | null
}
