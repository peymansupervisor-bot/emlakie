import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'
export const maxDuration = 60

const VARIANTS = [
  { name: 'thumb',  width: 800  },
  { name: 'medium', width: 1920 },
  { name: 'full',   width: null },
] as const

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB

function isHeic(buf: Buffer): boolean {
  if (buf.length < 12) return false
  const ftyp = buf.slice(4, 8).toString('ascii')
  const brand = buf.slice(8, 12).toString('ascii')
  return ftyp === 'ftyp' && /heic|heis|hevc|hevx|mif1|msf1/i.test(brand)
}

// Returns a JPEG-safe buffer.
// HEIC must be checked first — Sharp's prebuilt binary can read HEIC metadata but
// cannot decode the pixels (libde265 not bundled), so it passes metadata() and then
// crashes at toBuffer(). heic-convert uses its own WASM libheif with the decoder.
async function toJpegReadyBuffer(raw: Buffer): Promise<Buffer> {
  if (isHeic(raw)) {
    const heicConvert = require('heic-convert') as (o: { buffer: Buffer; format: 'JPEG'; quality: number }) => Promise<ArrayBuffer>
    const ab: ArrayBuffer = await heicConvert({ buffer: raw, format: 'JPEG', quality: 1 })
    return Buffer.from(new Uint8Array(ab))
  }
  try {
    await sharp(raw, { failOn: 'none' }).metadata()
    return raw
  } catch {
    throw new Error('Unsupported image format — only JPEG, PNG, WebP, TIFF, and HEIC are accepted')
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createSupabaseWithToken(token)
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as { path?: string }
    if (!body.path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })
    const { path } = body

    // Enforce that the path belongs to the authenticated user.
    // Path format: {userId}/{folder}/{filename} — the first segment must match.
    const pathOwner = path.split('/')[0]
    if (pathOwner !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminStorage = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    ).storage

    const { data: rawData, error: downloadErr } = await adminStorage.from('listing-photos').download(path)
    if (downloadErr || !rawData) {
      return NextResponse.json({ error: `Download failed: ${downloadErr?.message ?? 'no data'}` }, { status: 500 })
    }

    const rawBuffer = Buffer.from(await rawData.arrayBuffer())
    if (rawBuffer.length === 0) {
      return NextResponse.json({ error: 'Downloaded file is empty' }, { status: 500 })
    }
    if (rawBuffer.length > MAX_FILE_BYTES) {
      await adminStorage.from('listing-photos').remove([path])
      return NextResponse.json({ error: 'Photo exceeds the 25 MB size limit.' }, { status: 413 })
    }

    let inputBuffer: Buffer
    try {
      inputBuffer = await toJpegReadyBuffer(rawBuffer)
    } catch (e) {
      return NextResponse.json({ error: `Decode failed: ${(e as Error).message}` }, { status: 422 })
    }

    // Build clean variant paths: {userId}/{variant}/{filename}.jpg
    // Raw path is e.g. "abc123/originals/1700000000000-xyz" — no extension
    const userId = path.split('/')[0]
    const rawName = path.split('/').pop()!
    const baseName = rawName.replace(/\.[^.]+$/, '') // strip extension if present

    const urls: Record<string, string> = {}

    for (const variant of VARIANTS) {
      const pipeline = sharp(inputBuffer, { failOn: 'none' })
        .rotate()                                                          // honour EXIF orientation
        .toFormat('webp', { quality: 85 })                                // WebP — 30-50% smaller than JPEG at equal quality

      if (variant.width) {
        pipeline.resize(variant.width, null, { withoutEnlargement: true, fit: 'inside' })
      }

      let processed: Buffer
      try {
        processed = await pipeline.toBuffer()
      } catch (e) {
        return NextResponse.json({ error: `Encode failed (${variant.name}): ${(e as Error).message}` }, { status: 500 })
      }

      const variantPath = `${userId}/${variant.name}/${baseName}.webp`

      const { error: uploadErr } = await adminStorage
        .from('listing-photos')
        .upload(variantPath, processed, { contentType: 'image/webp', upsert: true })

      if (uploadErr) {
        return NextResponse.json({ error: `Upload failed (${variant.name}): ${uploadErr.message}` }, { status: 500 })
      }

      urls[variant.name] = adminStorage.from('listing-photos').getPublicUrl(variantPath).data.publicUrl
    }

    // Delete the raw original now that variants are stored
    await adminStorage.from('listing-photos').remove([path])

    return NextResponse.json(urls)
  } catch (e) {
    const msg = `Unexpected error: ${(e as Error).message}`;
    // user may not be available here if auth failed early, but we still log the error
    await logError({ source: 'Photo Processing', message: msg, details: (e as Error).stack, endpoint: 'POST /api/process-image', http_status: 500 });
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
