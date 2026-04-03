export const runtime = 'edge'

import { getCurrentUser } from '@/lib/auth'
import { getDB } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import type { Session } from '@/lib/types'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDB()
  const habit = await db.prepare('SELECT id FROM "Habit" WHERE id = ? AND userId = ?').bind(params.id, user.id).first()
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = 'SELECT * FROM "Session" WHERE habitId = ?'
  const binds: string[] = [params.id]
  if (from) { query += ' AND date >= ?'; binds.push(from) }
  if (to) { query += ' AND date <= ?'; binds.push(to) }
  query += ' ORDER BY date DESC'

  const { results } = await db.prepare(query).bind(...binds).all<Session>()
  return NextResponse.json(results)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDB()
  const habit = await db.prepare('SELECT id FROM "Habit" WHERE id = ? AND userId = ?').bind(params.id, user.id).first()
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json() as { date?: string; minutes?: number; note?: string | null }
  const { date, minutes, note } = body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date (expected YYYY-MM-DD)' }, { status: 400 })
  }
  if (typeof minutes !== 'number' || minutes < 1) {
    return NextResponse.json({ error: 'minutes must be a positive number' }, { status: 400 })
  }

  const existing = await db
    .prepare('SELECT id, minutes FROM "Session" WHERE habitId = ? AND date = ?')
    .bind(params.id, date)
    .first<{ id: string; minutes: number }>()

  let sessionId: string
  if (existing) {
    sessionId = existing.id
    await db
      .prepare('UPDATE "Session" SET minutes = ?, note = COALESCE(?, note), updatedAt = datetime(\'now\') WHERE id = ?')
      .bind(existing.minutes + minutes, note ?? null, sessionId)
      .run()
  } else {
    sessionId = crypto.randomUUID()
    await db
      .prepare('INSERT INTO "Session" (id, habitId, date, minutes, note) VALUES (?, ?, ?, ?, ?)')
      .bind(sessionId, params.id, date, minutes, note ?? null)
      .run()
  }

  const session = await db.prepare('SELECT * FROM "Session" WHERE id = ?').bind(sessionId).first<Session>()
  return NextResponse.json(session, { status: existing ? 200 : 201 })
}
