import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'

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

  const newUrls: string[] = []
  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadErr } = await supabase.storage
      .from('listing-photos')
      .upload(path, buffer, { contentType: file.type, upsert: false })
    if (!uploadErr) {
      const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(path)
      newUrls.push(publicUrl)
    }
  }

  const existingPhotos = (listing.photos as string[]) ?? []
  const updatedPhotos = [...existingPhotos, ...newUrls]

  const { error } = await supabase.from('listings').update({ photos: updatedPhotos }).eq('id', id).eq('landlord_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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

  const { data: listing } = await supabase.from('listings').select('photos').eq('id', id).eq('landlord_id', user.id).single()
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updatedPhotos = [...((listing.photos as string[]) ?? []), ...urls]
  const { error } = await supabase.from('listings').update({ photos: updatedPhotos }).eq('id', id).eq('landlord_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ photos: updatedPhotos })
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

  const updatedPhotos = ((listing.photos as string[]) ?? []).filter((p) => p !== photoUrl)
  const { error } = await supabase.from('listings').update({ photos: updatedPhotos }).eq('id', id).eq('landlord_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
