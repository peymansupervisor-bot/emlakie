import { NextRequest, NextResponse } from 'next/server'
import { filterListingContent, getViolationMessage } from '@/lib/content-filter'

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  try {
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
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Validate-listing', message: _msg, details: _stack, endpoint: 'POST /api/validate-listing', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
