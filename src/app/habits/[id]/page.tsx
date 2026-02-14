'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import EditLogModal from '@/components/EditLogModal'
import { calculateStreaks } from '@/lib/streaks'
import { HabitWithLogs } from '@/types'
import { startOfDay, parseISO } from 'date-fns'

export default function HabitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const habitId = parseInt(params.id as string)

  const [habit, setHabit] = useState<HabitWithLogs | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchHabit = async () => {
    try {
      const response = await fetch(`/api/habits/${habitId}`)
      if (response.ok) {
        const data = await response.json()
        setHabit(data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching habit:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabit()
  }, [habitId])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const getHoursForDate = (date: Date): number => {
    if (!habit) return 0
    const normalizedDate = startOfDay(date)
    const log = habit.logs.find(log => {
      const logDate = startOfDay(parseISO(log.date.toISOString()))
      return logDate.getTime() === normalizedDate.getTime()
    })
    return log?.hoursLogged ?? 0
  }

  const getLogIdForDate = (date: Date): number | null => {
    if (!habit) return null
    const normalizedDate = startOfDay(date)
    const log = habit.logs.find(log => {
      const logDate = startOfDay(parseISO(log.date.toISOString()))
      return logDate.getTime() === normalizedDate.getTime()
    })
    return log?.id ?? null
  }

  const handleSaveLog = async (hours: number) => {
    if (!selectedDate || !habit) return

    const logId = getLogIdForDate(selectedDate)

    if (logId) {
      // Update existing log
      await fetch(`/api/logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursLogged: hours })
      })
    } else {
      // Create new log
      await fetch(`/api/habits/${habitId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          hoursToAdd: hours
        })
      })
    }

    fetchHabit()
  }

  const handleDeleteLog = async () => {
    if (!selectedDate) return
    const logId = getLogIdForDate(selectedDate)
    if (!logId) return

    await fetch(`/api/logs/${logId}`, {
      method: 'DELETE'
    })

    fetchHabit()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    )
  }

  if (!habit) {
    return null
  }

  const { currentStreak, longestStreak } = calculateStreaks(habit.logs)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{habit.name}</h1>
          </div>
          <p className="text-gray-600">Daily Goal: {habit.dailyGoalHours} hours</p>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              🔥 {currentStreak}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              🏆 {longestStreak}
            </div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </div>
        </div>

        {/* Calendar */}
        <Calendar
          logs={habit.logs}
          color={habit.color}
          onDateClick={handleDateClick}
        />

        {/* Edit Log Modal */}
        <EditLogModal
          isOpen={isModalOpen}
          date={selectedDate}
          currentHours={selectedDate ? getHoursForDate(selectedDate) : 0}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveLog}
          onDelete={handleDeleteLog}
        />
      </div>
    </div>
  )
}
