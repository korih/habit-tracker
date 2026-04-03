'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-[var(--muted)] mb-4">Something went wrong.</p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-[#39d353] text-white text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
