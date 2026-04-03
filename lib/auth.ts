import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import { getDB } from './db'

const COOKIE_NAME = 'ht_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signJWT(payload: { userId: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifyJWT(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as { userId: string; email: string }
  } catch {
    return null
  }
}

const isProduction = (process.env.APP_URL ?? '').startsWith('https')
const secureFlag = isProduction ? '; Secure' : ''

export function makeSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=0`
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
}

export async function getCurrentUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyJWT(token)
  if (!payload) return null

  const db = getDB()
  const user = await db
    .prepare('SELECT id, email, name, image FROM "User" WHERE id = ?')
    .bind(payload.userId)
    .first<AuthUser>()

  return user ?? null
}

// Google OAuth helpers
export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<{ id_token: string } | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[exchangeGoogleCode] failed:', res.status, err)
    return null
  }
  return res.json()
}

export function decodeJWTPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.')
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(decoded)
}
