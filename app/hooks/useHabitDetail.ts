'use client'

import { useState, useEffect, useCallback } from 'react'
import type { HabitWithDailyTotals, Session, UpdateHabitInput } from '@/lib/types'

export function useHabitDetail(habitId: string) {
  const [habit, setHabit] = useState<HabitWithDailyTotals | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHabit = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`/api/habits/${habitId}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json() as HabitWithDailyTotals & { sessions: Session[] }
      setHabit(data)
      setSessions(data.sessions ?? [])
    } catch {
      setError('Failed to load habit')
    } finally {
      setLoading(false)
    }
  }, [habitId])

  useEffect(() => { fetchHabit() }, [fetchHabit])

  const updateHabit = async (data: UpdateHabitInput) => {
    const res = await fetch(`/api/habits/${habitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update')
    const updated = await res.json() as HabitWithDailyTotals & { sessions: Session[] }
    setHabit(updated)
    setSessions(updated.sessions ?? [])
    return updated
  }

  const logSession = async (date: string, minutes: number, note?: string) => {
    const res = await fetch(`/api/habits/${habitId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, minutes, note }),
    })
    if (!res.ok) throw new Error('Failed to log')
    await fetchHabit()
  }

  const deleteSession = async (date: string) => {
    const res = await fetch(`/api/habits/${habitId}/sessions/${date}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete')
    await fetchHabit()
  }

  return {
    habit,
    sessions,
    loading,
    error,
    refresh: fetchHabit,
    updateHabit,
    logSession,
    deleteSession,
  }
}
