export const runtime = 'edge'

import { buildGoogleAuthUrl } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/auth/callback`

  // Simple random state for CSRF protection
  const state = crypto.randomUUID()

  const authUrl = buildGoogleAuthUrl(redirectUri, state)

  const response = NextResponse.redirect(authUrl)
  // Store state in a short-lived cookie to verify on callback
  const isSecure = appUrl.startsWith('https')
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
