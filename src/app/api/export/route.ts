import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/export - Export all data as JSON
export async function GET() {
  try {
    const habits = await prisma.habit.findMany({
      include: {
        logs: true
      }
    })

    const exportData = {
      exportDate: new Date().toISOString(),
      habits
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
