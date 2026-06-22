import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import heicConvert from 'heic-convert'

export const runtime = 'nodejs'
export const maxDuration = 60

const VARIANTS = [
  { name: 'thumb',  width: 800  },
  { name: 'medium', width: 1920 },
  { name: 'full',   width: null },
] as const

function isHeic(buf: Buffer): boolean {
  // HEIC/HEIF magic: bytes 4-7 are 'ftyp', brand at 8-11 includes 'heic','heis','hevc','hevx','mif1','msf1'
  if (buf.length < 12) return false
  const ftyp = buf.slice(4, 8).toString('ascii')
  const brand = buf.slice(8, 12).toString('ascii')
  return ftyp === 'ftyp' && /heic|heis|hevc|hevx|mif1|msf1/i.test(brand)
}

export async function POST(req: NextRequest) {
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

  let inputBuffer = Buffer.from(await rawData.arrayBuffer())
  if (inputBuffer.length === 0) {
    return NextResponse.json({ error: 'Downloaded file is empty' }, { status: 500 })
  }

  // HEIC/HEIF files need server-side conversion — Sharp's prebuilt binary lacks the libheif decoder plugin
  if (isHeic(inputBuffer)) {
    inputBuffer = Buffer.from(await heicConvert({ buffer: inputBuffer, format: 'JPEG', quality: 1 }))
  }

  const urls: Record<string, string> = {}

  for (const variant of VARIANTS) {
    let pipeline = sharp(inputBuffer, { failOn: 'none' })
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

  await adminStorage.from('listing-photos').remove([path])
  return NextResponse.json(urls)
}
