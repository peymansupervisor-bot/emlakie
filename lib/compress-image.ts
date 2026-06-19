import sharp from 'sharp'

const MAX_DIMENSION = 1920
const JPEG_QUALITY = 82

export async function compressImage(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; contentType: string }> {
  let pipeline = sharp(buffer).rotate() // auto-orient via EXIF

  // HEIC needs explicit input format hint (sharp handles it via libvips)
  const meta = await pipeline.metadata()
  const isAnimated = (meta.pages ?? 1) > 1

  if (isAnimated) {
    // Animated WebP/GIF — skip resize, just return as-is
    return { buffer, contentType: mimeType }
  }

  pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })

  if (mimeType === 'image/png') {
    // PNG with alpha — keep as WebP to preserve transparency
    const out = await pipeline.webp({ quality: JPEG_QUALITY }).toBuffer()
    return { buffer: out, contentType: 'image/webp' }
  }

  // Everything else → JPEG
  const out = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
  return { buffer: out, contentType: 'image/jpeg' }
}
