'use client'

import { useState } from 'react'
import { getTodayString, formatDateLabel } from '@/lib/dates'
import type { Habit } from '@/lib/types'

interface LogSessionModalProps {
  habit: Habit
  initialDate?: string
  existingMinutes?: number
  onClose: () => void
  onLog: (date: string, minutes: number, note?: string) => Promise<void>
}

export function LogSessionModal({
  habit,
  initialDate,
  existingMinutes,
  onClose,
  onLog,
}: LogSessionModalProps) {
  const [date, setDate] = useState(initialDate ?? getTodayString())
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState(
    habit.targetMinutes ? String(habit.targetMinutes % 60) : '30'
  )
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totalMinutes = parseInt(hours || '0') * 60 + parseInt(minutes || '0')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalMinutes < 1) {
      setError('Please enter at least 1 minute')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onLog(date, totalMinutes, note || undefined)
      onClose()
    } catch {
      setError('Failed to log session. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="font-semibold text-[var(--text)] text-sm">Log session</h2>
            <p className="text-xs mt-0.5" style={{ color: habit.color }}>{habit.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={getTodayString()}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Duration</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  min="0"
                  max="23"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] text-sm text-center focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                />
                <p className="text-xs text-center text-[var(--muted)] mt-0.5">hours</p>
              </div>
              <span className="text-[var(--muted)] font-bold pb-4">:</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={minutes}
                  onChange={e => setMinutes(e.target.value)}
                  min="0"
                  max="59"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] text-sm text-center focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                />
                <p className="text-xs text-center text-[var(--muted)] mt-0.5">minutes</p>
              </div>
            </div>
            {existingMinutes !== undefined && existingMinutes > 0 && (
              <p className="text-xs text-[var(--muted)] mt-1.5">
                Already logged {existingMinutes}m today — this will be added on top
              </p>
            )}
          </div>

          {/* Optional note */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              Note <span className="text-[var(--muted)] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Feeling great today"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || totalMinutes < 1}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: habit.color }}
            >
              {saving ? 'Logging…' : `Log ${totalMinutes > 0 ? totalMinutes + 'm' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
