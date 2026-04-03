export const runtime = 'edge'

import { getCurrentUser } from '@/lib/auth'
import { getDB } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import type { Session } from '@/lib/types'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; date: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, date } = await params
  const db = getDB()
  const habit = await db.prepare('SELECT id FROM "Habit" WHERE id = ? AND userId = ?').bind(id, user.id).first()
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const session = await db
    .prepare('SELECT * FROM "Session" WHERE habitId = ? AND date = ?')
    .bind(id, date)
    .first<Session>()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const body = await req.json() as { minutes?: number; note?: string | null }

  const updates: string[] = ['updatedAt = datetime(\'now\')']
  const values: unknown[] = []
  if (typeof body.minutes === 'number' && body.minutes > 0) { updates.unshift('minutes = ?'); values.push(body.minutes) }
  if (body.note !== undefined) { updates.unshift('note = ?'); values.push(body.note) }
  values.push(session.id)

  await db.prepare(`UPDATE "Session" SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()
  const updated = await db.prepare('SELECT * FROM "Session" WHERE id = ?').bind(session.id).first<Session>()
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; date: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, date } = await params
  const db = getDB()
  const habit = await db.prepare('SELECT id FROM "Habit" WHERE id = ? AND userId = ?').bind(id, user.id).first()
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const session = await db
    .prepare('SELECT id FROM "Session" WHERE habitId = ? AND date = ?')
    .bind(id, date)
    .first<{ id: string }>()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  await db.prepare('DELETE FROM "Session" WHERE id = ?').bind(session.id).run()
  return NextResponse.json({ success: true })
}
