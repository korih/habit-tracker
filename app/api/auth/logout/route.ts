export const runtime = 'edge'

import { clearSessionCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const response = NextResponse.redirect(`${appUrl}/login`)
  response.headers.set('Set-Cookie', clearSessionCookie())
  return response
}
