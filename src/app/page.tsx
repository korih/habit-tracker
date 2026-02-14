'use client'

import { useEffect, useState } from 'react'
import HabitCard from '@/components/HabitCard'
import NewHabitModal from '@/components/NewHabitModal'
import { calculateStreaks, getTodayHours } from '@/lib/streaks'
import { HabitWithLogs, DashboardHabit } from '@/types'
import Link from 'next/link'

export default function Home() {
  const [habits, setHabits] = useState<DashboardHabit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      const data: HabitWithLogs[] = await response.json()
      
      const dashboardHabits: DashboardHabit[] = data.map(habit => ({
        id: habit.id,
        name: habit.name,
        color: habit.color,
        dailyGoalHours: habit.dailyGoalHours,
        todayHours: getTodayHours(habit.logs),
        currentStreak: calculateStreaks(habit.logs).currentStreak
      }))
      
      setHabits(dashboardHabits)
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  const handleCreateHabit = async (data: { name: string; dailyGoalHours: number; color: string }) => {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (response.ok) {
      fetchHabits()
    }
  }

  const handleAddTime = async (habitId: number, hours: number) => {
    const response = await fetch(`/api/habits/${habitId}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoursToAdd: hours })
    })

    if (response.ok) {
      fetchHabits()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Habit Tracker</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">Build streaks, track hours</p>
          </div>
          <Link 
            href="/settings"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No habits yet</h2>
            <p className="text-gray-600 mb-6">Create your first habit to start tracking!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Create Habit
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  {...habit}
                  onAddTime={handleAddTime}
                />
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors font-semibold"
            >
              + Add New Habit
            </button>
          </>
        )}
      </div>

      <NewHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateHabit}
      />
    </div>
  )
}
