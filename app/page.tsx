'use client'

import { useState } from 'react'
import { useHabits } from './hooks/useHabits'
import { HabitCard } from './components/HabitCard'
import { CreateHabitModal } from './components/CreateHabitModal'
import { LogSessionModal } from './components/LogSessionModal'
import { ThemeToggle } from './components/ThemeToggle'
import { UserMenu } from './components/UserMenu'
import type { HabitWithDailyTotals, CreateHabitInput } from '@/lib/types'

export default function DashboardPage() {
  const { habits, loading, error, createHabit, logSession } = useHabits()
  const [showCreate, setShowCreate] = useState(false)
  const [logTarget, setLogTarget] = useState<HabitWithDailyTotals | null>(null)

  const handleCreate = async (data: CreateHabitInput) => {
    await createHabit(data)
  }

  const handleLog = async (date: string, minutes: number, note?: string) => {
    if (!logTarget) return
    await logSession(logTarget.id, date, minutes, note)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-[var(--text)] text-lg tracking-tight">
            Habit Tracker
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted)] mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[#39d353] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#39d353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h2 className="font-semibold text-[var(--text)] mb-1">No habits yet</h2>
            <p className="text-sm text-[var(--muted)] mb-6">Create your first habit to start tracking</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-xl bg-[#39d353] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Create a habit
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onLogSession={setLogTarget}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      {habits.length > 0 && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#39d353] text-white shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center z-30"
          aria-label="Add habit"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateHabitModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}
      {logTarget && (
        <LogSessionModal
          habit={logTarget}
          onClose={() => setLogTarget(null)}
          onLog={handleLog}
        />
      )}
    </div>
  )
}
