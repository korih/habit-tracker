'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface EditLogModalProps {
  isOpen: boolean
  date: Date | null
  currentHours: number
  onClose: () => void
  onSave: (hours: number) => Promise<void>
  onDelete?: () => Promise<void>
}

export default function EditLogModal({
  isOpen,
  date,
  currentHours,
  onClose,
  onSave,
  onDelete
}: EditLogModalProps) {
  const [hours, setHours] = useState(currentHours.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setHours(currentHours.toString())
  }, [currentHours])

  if (!isOpen || !date) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(parseFloat(hours))
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsSubmitting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Edit Log - {format(date, 'MMM d, yyyy')}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
              Hours Logged
            </label>
            <input
              type="number"
              id="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              step="0.25"
              min="0"
              max="24"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            {currentHours > 0 && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Delete
              </button>
            )}
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
