import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay } from 'date-fns'

// POST /api/habits/[id]/log - Log time for a habit
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = parseInt(params.id)
    const body = await request.json()
    const { date, hoursToAdd } = body

    if (hoursToAdd === undefined) {
      return NextResponse.json(
        { error: 'Missing hoursToAdd' },
        { status: 400 }
      )
    }

    // Use provided date or default to today
    const targetDate = date ? new Date(date) : new Date()
    const normalizedDate = startOfDay(targetDate)

    // Check if log exists for this date
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: normalizedDate
        }
      }
    })

    let log
    if (existingLog) {
      // Update existing log
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: {
          hoursLogged: existingLog.hoursLogged + parseFloat(hoursToAdd)
        }
      })
    } else {
      // Create new log
      log = await prisma.habitLog.create({
        data: {
          habitId,
          date: normalizedDate,
          hoursLogged: parseFloat(hoursToAdd)
        }
      })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error logging time:', error)
    return NextResponse.json(
      { error: 'Failed to log time' },
      { status: 500 }
    )
  }
}
