'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { getToken } from '@/lib/landlord/client';

interface Props {
  listingId: string;
  initialPhotos: string[];
}

export default function PhotoManager({ listingId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setMsg(null);
    let succeeded = 0;
    let lastPhotos = photos;
    try {
      const token = await getToken();
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}…`);
        const fd = new FormData();
        fd.append('photos', files[i]);
        const res = await fetch(`/api/listings/${listingId}/photos`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        lastPhotos = data.photos;
        setPhotos(data.photos);
        succeeded++;
      }
      setMsg(`${succeeded} photo${succeeded > 1 ? 's' : ''} uploaded.`);
    } catch (err: unknown) {
      setPhotos(lastPhotos);
      setMsg(succeeded > 0
        ? `${succeeded} of ${files.length} uploaded — ${(err as Error).message}`
        : ((err as Error).message ?? 'Upload failed.'));
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(url: string) {
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
        <label className={`cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          {uploading ? (uploadProgress || 'Uploading…') : '+ Add photos'}
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
      </div>

      {msg && (
        <p className="mb-3 text-sm font-semibold text-brand-700">{msg}</p>
      )}

      {photos.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No photos yet. Add clean, watermark-free photos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((url, i) => (
            <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
              <Image src={url} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
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
              {i === 0 && (
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
