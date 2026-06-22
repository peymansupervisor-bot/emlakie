import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 60

const VARIANTS = [
  { name: 'thumb',  width: 400  },
  { name: 'medium', width: 1200 },
  { name: 'full',   width: null }, // original resolution
] as const

// POST /api/process-image
// Body: { path: string }  — path of the raw file in the listing-photos bucket
// Returns: { thumb: string, medium: string, full: string }
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { path } = await req.json() as { path: string }
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  // Service-role client bypasses RLS for server-side storage operations
  const adminStorage = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ).storage

  // Download raw file
  const { data: rawData, error: downloadErr } = await adminStorage.from('listing-photos').download(path)
  if (downloadErr || !rawData) {
    return NextResponse.json({ error: `Failed to download original: ${downloadErr?.message}` }, { status: 500 })
  }

  const rawBuffer = Buffer.from(await rawData.arrayBuffer())
  const urls: Record<string, string> = {}

  for (const variant of VARIANTS) {
    let pipeline = sharp(rawBuffer, { failOn: 'none' })
      .rotate()
      .toFormat('jpeg', { quality: 95, mozjpeg: true })

    if (variant.width) {
      pipeline = pipeline.resize(variant.width, null, { withoutEnlargement: true, fit: 'inside' })
    }

    const processed = await pipeline.toBuffer()
    const variantPath = path.replace(/^([^/]+)\//, `$1/${variant.name}/`).replace(/\.[^.]+$/, '.jpg')

    const { error: uploadErr } = await adminStorage
      .from('listing-photos')
      .upload(variantPath, processed, { contentType: 'image/jpeg', upsert: true })

    if (uploadErr) {
      return NextResponse.json({ error: `Failed to upload ${variant.name}: ${uploadErr.message}` }, { status: 500 })
    }

    urls[variant.name] = adminStorage.from('listing-photos').getPublicUrl(variantPath).data.publicUrl
  }

  // Delete raw original — only keep processed variants
  await adminStorage.from('listing-photos').remove([path])

  return NextResponse.json(urls)
}
