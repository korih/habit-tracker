'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SettingsPage() {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export')
      const data = await response.json()

      // Create blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Data Management</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Export Data</h3>
              <p className="text-gray-600 text-sm mb-3">
                Download all your habits and logs as a JSON file. You can use this for backup or to migrate your data.
              </p>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isExporting ? 'Exporting...' : 'Export Data as JSON'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">About</h2>
          <div className="text-gray-600 space-y-2">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Tech Stack:</strong> Next.js, TypeScript, Tailwind CSS, Prisma, SQLite</p>
            <p className="text-sm mt-4">
              Built to help you build consistent habits and track your progress over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
