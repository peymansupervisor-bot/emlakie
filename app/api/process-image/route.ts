import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 60

const VARIANTS = [
  { name: 'thumb',  width: 800  },
  { name: 'medium', width: 1920 },
  { name: 'full',   width: null },
] as const

function isHeic(buf: Buffer): boolean {
  if (buf.length < 12) return false
  const ftyp = buf.slice(4, 8).toString('ascii')
  const brand = buf.slice(8, 12).toString('ascii')
  return ftyp === 'ftyp' && /heic|heis|hevc|hevx|mif1|msf1/i.test(brand)
}

async function toProcessableBuffer(raw: Buffer): Promise<Buffer> {
  // Try sharp directly first — on Linux (Vercel) the prebuilt binary statically
  // links libde265, so HEIC decodes natively. Falls back to heic-convert WASM
  // for environments where the native HEVC decoder isn't available.
  try {
    await sharp(raw, { failOn: 'none' }).metadata()
    return raw
  } catch {
    // Sharp can't read this file — try heic-convert if it looks like HEIC/HEIF
    if (!isHeic(raw)) throw new Error('Unsupported image format')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const heicConvert = require('heic-convert') as (opts: { buffer: Buffer; format: 'JPEG'; quality: number }) => Promise<ArrayBuffer | Buffer>
    const result = await heicConvert({ buffer: raw, format: 'JPEG', quality: 1 })
    return Buffer.from(result)
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createSupabaseWithToken(token)
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { path } = await req.json() as { path: string }
    if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

    const adminStorage = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    ).storage

    const { data: rawData, error: downloadErr } = await adminStorage.from('listing-photos').download(path)
    if (downloadErr || !rawData) {
      return NextResponse.json({ error: `Failed to download original: ${downloadErr?.message}` }, { status: 500 })
    }

    const rawBuffer = Buffer.from(await rawData.arrayBuffer())
    if (rawBuffer.length === 0) {
      return NextResponse.json({ error: 'Downloaded file is empty' }, { status: 500 })
    }

    let inputBuffer: Buffer
    try {
      inputBuffer = await toProcessableBuffer(rawBuffer)
    } catch (e) {
      return NextResponse.json({ error: `Image decode failed: ${(e as Error).message}` }, { status: 500 })
    }

    const urls: Record<string, string> = {}

    for (const variant of VARIANTS) {
      let pipeline = sharp(inputBuffer, { failOn: 'none' })
        .rotate()
        .toFormat('jpeg', { quality: 95, mozjpeg: true })

      if (variant.width) {
        pipeline = pipeline.resize(variant.width, null, { withoutEnlargement: true, fit: 'inside' })
      }

      let processed: Buffer
      try {
        processed = await pipeline.toBuffer()
      } catch (e) {
        return NextResponse.json({ error: `Sharp encode failed (${variant.name}): ${(e as Error).message}` }, { status: 500 })
      }

      const variantPath = path.replace(/^([^/]+)\//, `$1/${variant.name}/`).replace(/\.[^.]+$/, '.jpg') + (path.includes('.') ? '' : '.jpg')

      const { error: uploadErr } = await adminStorage
        .from('listing-photos')
        .upload(variantPath, processed, { contentType: 'image/jpeg', upsert: true })

      if (uploadErr) {
        return NextResponse.json({ error: `Failed to upload ${variant.name}: ${uploadErr.message}` }, { status: 500 })
      }

      urls[variant.name] = adminStorage.from('listing-photos').getPublicUrl(variantPath).data.publicUrl
    }

    await adminStorage.from('listing-photos').remove([path])
    return NextResponse.json(urls)
  } catch (e) {
    return NextResponse.json({ error: `Unexpected error: ${(e as Error).message}` }, { status: 500 })
  }
}
