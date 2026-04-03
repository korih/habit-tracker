'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHabitDetail } from '@/app/hooks/useHabitDetail'
import { FullCalendar } from '@/app/components/FullCalendar'
import { StatsPanel } from '@/app/components/StatsPanel'
import { LogSessionModal } from '@/app/components/LogSessionModal'
import { CreateHabitModal } from '@/app/components/CreateHabitModal'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { formatMinutes, formatHours } from '@/lib/colors'
import { formatDateLabel, getMonthName } from '@/lib/dates'
import type { UpdateHabitInput } from '@/lib/types'

export default function HabitDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { habit, sessions, loading, error, updateHabit, logSession, deleteSession, refresh } =
    useHabitDetail(params.id)

  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showLog, setShowLog] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(calYear, calMonth - 1 + dir, 1)
    setCalYear(d.getFullYear())
    setCalMonth(d.getMonth() + 1)
    setSelectedDate(null)
  }

  const handleDayClick = (date: string) => {
    setSelectedDate(prev => (prev === date ? null : date))
    setShowLog(true)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this habit and all its data?')) return
    setDeleting(true)
    try {
      await fetch(`/api/habits/${params.id}`, { method: 'DELETE' })
      router.push('/')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[#39d353] animate-spin" />
      </div>
    )
  }

  if (error || !habit) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--muted)] mb-3">{error ?? 'Habit not found'}</p>
          <button onClick={() => router.push('/')} className="text-sm text-[#39d353] hover:underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  // Session for selected date
  const selectedSession = selectedDate
    ? sessions.find(s => s.date === selectedDate)
    : null

  // Filter sessions for current calendar month
  const monthPrefix = `${calYear}-${String(calMonth).padStart(2, '0')}`
  const monthSessions = sessions
    .filter(s => s.date.startsWith(monthPrefix))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
            <h1 className="font-semibold text-[var(--text)] truncate">{habit.name}</h1>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
              aria-label="Edit habit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50"
              aria-label="Delete habit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Stats */}
        <StatsPanel stats={habit.stats} habit={habit} />

        {/* Calendar */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h2 className="font-semibold text-[var(--text)] text-sm">
              {getMonthName(calMonth)} {calYear}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              disabled={calYear === now.getFullYear() && calMonth === now.getMonth() + 1}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <FullCalendar
            year={calYear}
            month={calMonth}
            dailyTotals={habit.dailyTotals}
            color={habit.color}
            onDayClick={handleDayClick}
            selectedDate={selectedDate}
          />
        </div>

        {/* Log session button */}
        <button
          onClick={() => { setSelectedDate(null); setShowLog(true) }}
          className="w-full py-3 rounded-xl font-medium text-sm text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: habit.color }}
        >
          + Log session
        </button>

        {/* Session list for this month */}
        {monthSessions.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
              {getMonthName(calMonth)} sessions
            </h3>
            <div className="space-y-2">
              {monthSessions.map(session => (
                <div
                  key={session.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2.5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-[var(--text)] font-medium">{formatDateLabel(session.date)}</p>
                    {session.note && (
                      <p className="text-xs text-[var(--muted)] mt-0.5">{session.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: habit.color }}>
                      {formatMinutes(session.minutes)}
                    </span>
                    <button
                      onClick={() => deleteSession(session.date)}
                      className="text-[var(--muted)] hover:text-red-400 transition-colors"
                      aria-label="Delete session"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showLog && (
        <LogSessionModal
          habit={habit}
          initialDate={selectedDate ?? undefined}
          existingMinutes={selectedSession?.minutes}
          onClose={() => { setShowLog(false); setSelectedDate(null) }}
          onLog={async (date, minutes, note) => {
            await logSession(date, minutes, note)
          }}
        />
      )}
      {showEdit && (
        <CreateHabitModal
          habit={habit}
          onClose={() => setShowEdit(false)}
          onSave={async data => { await updateHabit(data as UpdateHabitInput) }}
        />
      )}
    </div>
  )
}
