'use client'

import Link from 'next/link'
import { useState } from 'react'

interface HabitCardProps {
  id: number
  name: string
  color: string
  dailyGoalHours: number
  todayHours: number
  currentStreak: number
  onAddTime: (habitId: number, hours: number) => Promise<void>
}

export default function HabitCard({
  id,
  name,
  color,
  dailyGoalHours,
  todayHours,
  currentStreak,
  onAddTime
}: HabitCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const progressPercentage = Math.min((todayHours / dailyGoalHours) * 100, 100)

  const handleAddTime = async (hours: number) => {
    setIsAdding(true)
    try {
      await onAddTime(id, hours)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <Link href={`/habits/${id}`}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="flex items-center">
              🔥 <span className="ml-1 font-semibold">{currentStreak} day streak</span>
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Today's Progress</span>
            <span className="font-semibold">
              {todayHours.toFixed(1)}h / {dailyGoalHours}h
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      </Link>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleAddTime(0.25)}
          disabled={isAdding}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          +15m
        </button>
        <button
          onClick={() => handleAddTime(1)}
          disabled={isAdding}
          className="flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          style={{ backgroundColor: color }}
        >
          +1h
        </button>
      </div>
    </div>
  )
}
