'use client'

import { useState } from 'react'
import { ColorPicker } from './ColorPicker'
import type { Habit, CreateHabitInput, UpdateHabitInput } from '@/lib/types'

interface CreateHabitModalProps {
  habit?: Habit | null
  onClose: () => void
  onSave: (data: { name?: string; color?: string; targetMinutes?: number | null; targetTotalHours?: number | null }) => Promise<void>
}

export function CreateHabitModal({ habit, onClose, onSave }: CreateHabitModalProps) {
  const [name, setName] = useState(habit?.name ?? '')
  const [color, setColor] = useState(habit?.color ?? '#39d353')
  const [targetMinutes, setTargetMinutes] = useState(
    habit?.targetMinutes ? String(habit.targetMinutes) : ''
  )
  const [targetTotalHours, setTargetTotalHours] = useState(
    habit?.targetTotalHours ? String(habit.targetTotalHours) : ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        name: name.trim(),
        color,
        targetMinutes: targetMinutes ? parseInt(targetMinutes) : null,
        targetTotalHours: targetTotalHours ? parseFloat(targetTotalHours) : null,
      })
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--text)]">
            {habit ? 'Edit Habit' : 'New Habit'}
          </h2>
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

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Habit name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Read, Meditate, Exercise"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': color } as React.CSSProperties}
              autoFocus
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Color
            </label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {/* Optional targets */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Session target (min)
              </label>
              <input
                type="number"
                value={targetMinutes}
                onChange={e => setTargetMinutes(e.target.value)}
                placeholder="e.g. 30"
                min="1"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Total goal (hours)
              </label>
              <input
                type="number"
                value={targetTotalHours}
                onChange={e => setTargetTotalHours(e.target.value)}
                placeholder="e.g. 100"
                min="1"
                step="0.5"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
              />
            </div>
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
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {saving ? 'Saving…' : habit ? 'Save changes' : 'Create habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
