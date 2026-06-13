import { NextRequest, NextResponse } from 'next/server'
import { filterListingContent, getViolationMessage } from '@/lib/content-filter'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { text } = body

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }

  const result = filterListingContent(text)

  if (!result.allowed) {
    return NextResponse.json({
      allowed: false,
      message: getViolationMessage(result.violations),
      violations: result.violations,
    }, { status: 422 })
  }

  return NextResponse.json({ allowed: true })
}
