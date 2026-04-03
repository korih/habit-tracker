export const runtime = 'edge'

import { exchangeGoogleCode, decodeJWTPayload, signJWT, makeSessionCookie } from '@/lib/auth'
import { getDB } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/auth/callback`

  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const storedState = req.cookies.get('oauth_state')?.value

    if (!code) {
      return NextResponse.redirect(`${appUrl}/login?error=invalid_state`)
    }
    if (storedState && state !== storedState) {
      return NextResponse.redirect(`${appUrl}/login?error=invalid_state`)
    }

    const tokens = await exchangeGoogleCode(code, redirectUri)
    if (!tokens?.id_token) {
      console.error('[auth/callback] token exchange failed. tokens:', JSON.stringify(tokens))
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`)
    }

    const profile = decodeJWTPayload(tokens.id_token)
    const googleId = profile.sub as string
    const email = profile.email as string
    const name = (profile.name as string) ?? null
    const image = (profile.picture as string) ?? null

    const db = getDB()

    // Upsert user
    const existing = await db
      .prepare('SELECT id FROM "User" WHERE googleId = ?')
      .bind(googleId)
      .first<{ id: string }>()

    let userId: string
    if (existing) {
      userId = existing.id
      await db
        .prepare('UPDATE "User" SET email = ?, name = ?, image = ?, updatedAt = datetime(\'now\') WHERE id = ?')
        .bind(email, name, image, userId)
        .run()
    } else {
      userId = crypto.randomUUID()
      await db
        .prepare('INSERT INTO "User" (id, email, name, image, googleId) VALUES (?, ?, ?, ?, ?)')
        .bind(userId, email, name, image, googleId)
        .run()
    }

    const token = await signJWT({ userId, email })

    const response = NextResponse.redirect(`${appUrl}/`)
    response.headers.append('Set-Cookie', makeSessionCookie(token))
    response.headers.append('Set-Cookie', `oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`)

    return response
  } catch (err) {
    console.error('[auth/callback] error:', err)
    return NextResponse.redirect(`${appUrl}/login?error=server_error`)
  }
}
