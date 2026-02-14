'use client'

import { useState } from 'react'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
  parseISO
} from 'date-fns'
import { HabitLog } from '@prisma/client'

interface CalendarProps {
  logs: HabitLog[]
  color: string
  onDateClick: (date: Date) => void
}

export default function Calendar({ logs, color, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Get all days in the month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Calculate starting day of week (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = monthStart.getDay()
  
  // Create empty cells for days before month starts
  const emptyCells = Array(startDayOfWeek).fill(null)
  
  // Get hours logged for a specific date
  const getHoursForDate = (date: Date): number => {
    const normalizedDate = startOfDay(date)
    const log = logs.find(log => {
      const logDate = startOfDay(parseISO(log.date.toISOString()))
      return isSameDay(logDate, normalizedDate)
    })
    return log?.hoursLogged ?? 0
  }

  // Calculate maximum hours in any day for scaling
  const maxHours = Math.max(...logs.map(log => log.hoursLogged), 1)

  const getOpacity = (hours: number): number => {
    if (hours === 0) return 0
    // Scale between 0.3 and 1.0
    return 0.3 + (hours / maxHours) * 0.7
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {daysInMonth.map(date => {
          const hours = getHoursForDate(date)
          const opacity = getOpacity(hours)
          const isToday = isSameDay(date, new Date())

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 ${
                isToday ? 'ring-2 ring-gray-800' : ''
              }`}
              style={{
                backgroundColor: opacity > 0 ? color : '#f3f4f6',
                opacity: opacity > 0 ? opacity : 1
              }}
            >
              <span className={`text-sm font-medium ${opacity > 0 ? 'text-white' : 'text-gray-800'}`}>
                {format(date, 'd')}
              </span>
              {hours > 0 && (
                <span className="text-xs text-white font-semibold mt-0.5">
                  {hours}h
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
