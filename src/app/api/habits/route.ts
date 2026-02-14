import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay } from 'date-fns'

// GET /api/habits - Get all habits with their logs
export async function GET() {
  try {
    const habits = await prisma.habit.findMany({
      include: {
        logs: {
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, dailyGoalHours, color } = body

    if (!name || !dailyGoalHours || !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        dailyGoalHours: parseFloat(dailyGoalHours),
        color
      }
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    )
  }
}
