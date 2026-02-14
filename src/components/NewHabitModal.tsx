'use client'

import { useState } from 'react'

interface NewHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; dailyGoalHours: number; color: string }) => Promise<void>
}

const PRESET_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

export default function NewHabitModal({ isOpen, onClose, onSubmit }: NewHabitModalProps) {
  const [name, setName] = useState('')
  const [dailyGoalHours, setDailyGoalHours] = useState('1')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        dailyGoalHours: parseFloat(dailyGoalHours),
        color
      })
      setName('')
      setDailyGoalHours('1')
      setColor(PRESET_COLORS[0])
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Habit</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Habit Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g., Read, Exercise, Code"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
              Daily Goal (hours)
            </label>
            <input
              type="number"
              id="goal"
              value={dailyGoalHours}
              onChange={(e) => setDailyGoalHours(e.target.value)}
              step="0.25"
              min="0.25"
              max="24"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-10 h-10 rounded-lg transition-transform ${
                    color === presetColor ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : ''
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
