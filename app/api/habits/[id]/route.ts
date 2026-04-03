export const runtime = 'edge'

import { getCurrentUser } from '@/lib/auth'
import { getDB } from '@/lib/db'
import { computeStats } from '@/lib/stats'
import { NextRequest, NextResponse } from 'next/server'
import type { Habit, Session } from '@/lib/types'

async function getOwnedHabit(id: string, userId: string) {
  const db = getDB()
  const habit = await db
    .prepare('SELECT * FROM "Habit" WHERE id = ? AND userId = ?')
    .bind(id, userId)
    .first<Habit>()
  return { db, habit }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { db, habit } = await getOwnedHabit(id, user.id)
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { results: sessions } = await db
    .prepare('SELECT * FROM "Session" WHERE habitId = ? ORDER BY date DESC')
    .bind(habit.id)
    .all<Session>()

  const dailyTotals = sessions.map(s => ({ date: s.date, minutes: s.minutes }))
  return NextResponse.json({ ...habit, sessions, dailyTotals, stats: computeStats(dailyTotals, habit.targetTotalHours) })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { db, habit } = await getOwnedHabit(id, user.id)
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json() as { name?: string; color?: string; targetMinutes?: number | null; targetTotalHours?: number | null; archived?: boolean }

  const updates: string[] = []
  const values: unknown[] = []

  if (body.name !== undefined) { updates.push('name = ?'); values.push(body.name.trim()) }
  if (body.color !== undefined) { updates.push('color = ?'); values.push(body.color) }
  if (body.targetMinutes !== undefined) { updates.push('targetMinutes = ?'); values.push(body.targetMinutes) }
  if (body.targetTotalHours !== undefined) { updates.push('targetTotalHours = ?'); values.push(body.targetTotalHours) }
  if (body.archived !== undefined) { updates.push('archived = ?'); values.push(body.archived ? 1 : 0) }

  if (updates.length > 0) {
    updates.push('updatedAt = datetime(\'now\')')
    values.push(id)
    await db.prepare(`UPDATE "Habit" SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()
  }

  const updated = await db.prepare('SELECT * FROM "Habit" WHERE id = ?').bind(id).first<Habit>()
  const { results: sessions } = await db.prepare('SELECT * FROM "Session" WHERE habitId = ? ORDER BY date DESC').bind(id).all<Session>()
  const dailyTotals = sessions.map(s => ({ date: s.date, minutes: s.minutes }))

  return NextResponse.json({ ...updated, sessions, dailyTotals, stats: computeStats(dailyTotals, updated?.targetTotalHours ?? null) })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { db, habit } = await getOwnedHabit(id, user.id)
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.prepare('DELETE FROM "Habit" WHERE id = ?').bind(id).run()
  return NextResponse.json({ success: true })
}
