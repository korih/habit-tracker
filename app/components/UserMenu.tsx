'use client'

import { useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'

export function UserMenu() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase()

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full focus:outline-none"
        aria-label="User menu"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? user.email}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#39d353] flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
            <div className="px-3 py-2.5 border-b border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--text)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2.5 text-sm text-[var(--muted)] hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
