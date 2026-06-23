import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { compressImage } from '@/lib/compress-image'
import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'

const MAX_PHOTOS = 25;
const MIN_PHOTOS = 1;

// POST /api/listings/[id]/photos — upload new photos and append to listing
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: listing } = await supabase.from('listings').select('photos').eq('id', id).eq('landlord_id', user.id).single()
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await req.formData()
  const files = formData.getAll('photos') as File[]

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB raw upload limit (compressed output will be far smaller)

  const newUrls: string[] = []
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) continue;
    if (file.size > MAX_SIZE) continue;
    const raw = Buffer.from(await file.arrayBuffer())
    const { buffer, contentType } = await compressImage(raw, file.type)
    const ext = contentType === 'image/webp' ? 'webp' : 'jpg'
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('listing-photos')
      .upload(path, buffer, { contentType, upsert: false })
    if (uploadErr) {
      await logError({ source: 'Photo Upload', message: uploadErr.message, user_id: user.id, endpoint: `POST /api/listings/${id}/photos`, http_status: 500, context: { listing_id: id, file_type: file.type, file_size: file.size } });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(path)
      newUrls.push(publicUrl)
    }
  }

  const existingPhotos = (listing.photos as string[]) ?? []
  if (existingPhotos.length >= MAX_PHOTOS) return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos allowed.` }, { status: 400 })
  const updatedPhotos = [...existingPhotos, ...newUrls].slice(0, MAX_PHOTOS)

  const { error } = await supabase.from('listings').update({ photos: updatedPhotos }).eq('id', id).eq('landlord_id', user.id)
  if (error) {
    await logError({ source: 'Photo Upload', message: error.message, user_id: user.id, endpoint: `POST /api/listings/${id}/photos`, http_status: 500, context: { listing_id: id } });
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }

  return NextResponse.json({ photos: updatedPhotos })
}

// PATCH /api/listings/[id]/photos — append already-uploaded URLs to listing (client uploads directly to storage)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { urls } = await req.json()
  if (!Array.isArray(urls) || urls.length === 0) return NextResponse.json({ error: 'urls required' }, { status: 400 })

  // Only allow URLs from our own Supabase storage
  const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
  const validUrls = urls.filter((u: unknown) => {
    if (typeof u !== 'string') return false;
    try { return new URL(u).hostname === supabaseHost; } catch { return false; }
  });
  if (validUrls.length === 0) return NextResponse.json({ error: 'Invalid photo URLs' }, { status: 400 })

  const { data: listing } = await supabase.from('listings').select('photos').eq('id', id).eq('landlord_id', user.id).single()
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existingPhotos = (listing.photos as string[]) ?? []
  if (existingPhotos.length >= MAX_PHOTOS) return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos allowed.` }, { status: 400 })
  const updatedPhotos = [...existingPhotos, ...validUrls].slice(0, MAX_PHOTOS)

  const { error } = await supabase.from('listings').update({ photos: updatedPhotos }).eq('id', id).eq('landlord_id', user.id)
  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })

  return NextResponse.json({ photos: updatedPhotos })
}

// PUT /api/listings/[id]/photos — replace entire photos array (used for reordering)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photos } = await req.json()
  if (!Array.isArray(photos)) return NextResponse.json({ error: 'photos required' }, { status: 400 })

  const { data: listing } = await supabase.from('listings').select('id').eq('id', id).eq('landlord_id', user.id).single()
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('listings').update({ photos }).eq('id', id).eq('landlord_id', user.id)
  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })

  return NextResponse.json({ photos })
}

// DELETE /api/listings/[id]/photos — remove a specific photo URL from listing
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoUrl } = await req.json()
  if (!photoUrl) return NextResponse.json({ error: 'photoUrl required' }, { status: 400 })

  const { data: listing } = await supabase.from('listings').select('photos').eq('id', id).eq('landlord_id', user.id).single()
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const currentPhotos = (listing.photos as string[]) ?? []
  if (currentPhotos.length <= MIN_PHOTOS) return NextResponse.json({ error: `Minimum ${MIN_PHOTOS} photos required.` }, { status: 400 })
  const updatedPhotos = currentPhotos.filter((p) => p !== photoUrl)
  const { error } = await supabase.from('listings').update({ photos: updatedPhotos }).eq('id', id).eq('landlord_id', user.id)
  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })

  // Also delete from storage if it's our own bucket
  try {
    const urlPath = new URL(photoUrl).pathname
    const bucketPrefix = '/storage/v1/object/public/listing-photos/'
    if (urlPath.includes(bucketPrefix)) {
      const storagePath = urlPath.split(bucketPrefix)[1]
      await supabase.storage.from('listing-photos').remove([storagePath])
    }
  } catch { /* ignore storage delete errors */ }

  return NextResponse.json({ photos: updatedPhotos })
}
