import { NextResponse } from 'next/server'

export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return NextResponse.json({
    cwd: process.cwd(),
    hasUrl: !!url,
    hasKey: !!key,
    urlLen: url.length,
    keyLen: key.length,
  })
}