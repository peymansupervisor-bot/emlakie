'use client';

import { useRef, useState } from 'react';
import { getToken } from '@/lib/landlord/client';
import { supabase } from '@/lib/supabase';

const MAX_PX = 1200;
const JPEG_QUALITY = 0.75;
const MAX_PHOTOS = 25;
const MIN_PHOTOS = 1;

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : file),
        'image/jpeg',
        JPEG_QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

interface Props {
  listingId: string;
  initialPhotos: string[];
}

export default function PhotoManager({ listingId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [settingCoverUrl, setSettingCoverUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { setMsg(`Maximum ${MAX_PHOTOS} photos allowed.`); return; }
    const toUpload = files.slice(0, remaining);
    if (toUpload.length < files.length) setMsg(`Only ${remaining} slot${remaining > 1 ? 's' : ''} remaining — uploading first ${toUpload.length}.`);
    setUploading(true);
    const newUrls: string[] = [];
    const skipped: string[] = [];
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      for (let i = 0; i < toUpload.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${toUpload.length}…`);
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from('listing-photos')
          .upload(path, toUpload[i], { contentType: toUpload[i].type || 'image/jpeg', upsert: false });
        if (uploadErr) { skipped.push(toUpload[i].name); continue; }
        const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(path);

        newUrls.push(publicUrl);
      }

      if (newUrls.length === 0) {
        const reason = skipped.length > 0 ? 'Photos were flagged and not uploaded.' : 'No photos were uploaded.';
        setMsg(reason);
        return;
      }

      // Append all new URLs to the listing in one API call
      const token = await getToken();
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: newUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhotos(data.photos);
      const msg = skipped.length > 0
        ? `${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} uploaded. ${skipped.length} skipped (flagged or failed).`
        : `${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} uploaded.`;
      setMsg(msg);
    } catch (err: unknown) {
      setMsg((err as Error).message ?? 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSetCover(url: string) {
    setSettingCoverUrl(url);
    setMsg(null);
    try {
      const token = await getToken();
      const reordered = [url, ...photos.filter((p) => p !== url)];
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: reordered }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhotos(data.photos);
      setMsg('Cover photo updated.');
    } catch (err: unknown) {
      setMsg((err as Error).message ?? 'Failed to update cover.');
    } finally {
      setSettingCoverUrl(null);
    }
  }

  async function handleDelete(url: string) {
    if (photos.length <= MIN_PHOTOS) { setMsg(`Minimum ${MIN_PHOTOS} photos required.`); return; }
    setDeletingUrl(url);
    setMsg(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhotos(data.photos);
      setMsg('Photo removed.');
    } catch (err: unknown) {
      setMsg((err as Error).message ?? 'Delete failed.');
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">Photos</h2>
        {photos.length >= MAX_PHOTOS ? (
          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400">25 photo limit reached</span>
        ) : (
          <label className={`cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            {uploading ? (uploadProgress || 'Uploading…') : `+ Add photos (${photos.length}/25)`}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {msg && (
        <p className="mb-3 text-sm font-semibold text-brand-700">{msg}</p>
      )}

      {photos.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No photos yet. Add at least {MIN_PHOTOS} clean, watermark-free photos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((url, i) => (
            <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
              <img src={url} alt={`Photo ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
              <button
                onClick={() => handleDelete(url)}
                disabled={deletingUrl === url}
                aria-label="Remove photo"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
              >
                {deletingUrl === url ? (
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
              {i === 0 ? (
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>
              ) : (
                <button
                  onClick={() => handleSetCover(url)}
                  disabled={settingCoverUrl === url}
                  aria-label="Set as cover"
                  className="absolute bottom-2 left-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 opacity-0 shadow transition hover:bg-brand-600 hover:text-white group-hover:opacity-100 disabled:opacity-50"
                >
                  {settingCoverUrl === url ? '…' : 'Set cover'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
