export const runtime = 'edge'

import { getCurrentUser } from '@/lib/auth'
import { getDB } from '@/lib/db'
import { computeStats } from '@/lib/stats'
import { NextRequest, NextResponse } from 'next/server'
import type { Habit, Session } from '@/lib/types'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDB()

  const { results: habits } = await db
    .prepare('SELECT * FROM "Habit" WHERE userId = ? AND archived = 0 ORDER BY sortOrder ASC, createdAt ASC')
    .bind(user.id)
    .all<Habit>()

  const result = await Promise.all(habits.map(async habit => {
    const { results: sessions } = await db
      .prepare('SELECT date, minutes FROM "Session" WHERE habitId = ?')
      .bind(habit.id)
      .all<{ date: string; minutes: number }>()

    const dailyTotals = sessions
    const stats = computeStats(dailyTotals, habit.targetTotalHours)
    return { ...habit, dailyTotals, stats }
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { name?: string; color?: string; targetMinutes?: number | null; targetTotalHours?: number | null }
  const { name, color, targetMinutes, targetTotalHours } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  try {
    const db = getDB()
    const id = crypto.randomUUID()

    await db
      .prepare('INSERT INTO "Habit" (id, name, color, targetMinutes, targetTotalHours, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))')
      .bind(id, name.trim(), color ?? '#39d353', targetMinutes ?? null, targetTotalHours ?? null, user.id)
      .run()

    const habit = await db
      .prepare('SELECT * FROM "Habit" WHERE id = ?')
      .bind(id)
      .first<Habit>()

    return NextResponse.json({ ...habit, dailyTotals: [], stats: computeStats([], targetTotalHours ?? null) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/habits] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
