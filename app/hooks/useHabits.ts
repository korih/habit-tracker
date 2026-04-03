'use client'

import { useState, useEffect, useCallback } from 'react'
import type { HabitWithDailyTotals, CreateHabitInput, UpdateHabitInput } from '@/lib/types'

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithDailyTotals[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHabits = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/habits')
      if (!res.ok) throw new Error('Failed to fetch')
      setHabits(await res.json())
    } catch {
      setError('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const createHabit = async (data: CreateHabitInput) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create')
    const habit = await res.json() as HabitWithDailyTotals
    setHabits(prev => [...prev, habit])
    return habit
  }

  const updateHabit = async (id: string, data: UpdateHabitInput) => {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update')
    const updated = await res.json() as HabitWithDailyTotals
    setHabits(prev => prev.map(h => (h.id === id ? updated : h)))
    return updated
  }

  const deleteHabit = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  const logSession = async (habitId: string, date: string, minutes: number, note?: string) => {
    const res = await fetch(`/api/habits/${habitId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, minutes, note }),
    })
    if (!res.ok) throw new Error('Failed to log session')
    // Refresh habits to get updated stats
    await fetchHabits()
  }

  return {
    habits,
    loading,
    error,
    refresh: fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    logSession,
  }
}
