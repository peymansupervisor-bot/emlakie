'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { getToken } from '@/lib/landlord/client';
import { supabase } from '@/lib/supabase';

const MAX_PHOTOS = 25;
const MIN_PHOTOS = 1;
const MAX_PHOTO_BYTES = 25 * 1024 * 1024;

interface Props {
  listingId: string;
  initialPhotos: string[];
}

export default function PhotoManager({ listingId, initialPhotos }: Props) {
  const [savedPhotos, setSavedPhotos] = useState<string[]>(initialPhotos);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const fileRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(pendingPhotos) !== JSON.stringify(savedPhotos);

  function showMsg(text: string, type: 'success' | 'error' = 'success') {
    setMsg(text);
    setMsgType(type);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - pendingPhotos.length;
    if (remaining <= 0) { showMsg(`Maximum ${MAX_PHOTOS} photos allowed.`, 'error'); return; }
    const oversized = files.filter((f) => f.size > MAX_PHOTO_BYTES);
    if (oversized.length > 0) showMsg(`${oversized.length} photo${oversized.length > 1 ? 's exceed' : ' exceeds'} the 25 MB limit and ${oversized.length > 1 ? 'were' : 'was'} skipped.`, 'error');
    const sized = files.filter((f) => f.size <= MAX_PHOTO_BYTES);
    const toUpload = sized.slice(0, remaining);
    if (toUpload.length === 0) return;
    if (toUpload.length < sized.length) showMsg(`Only ${remaining} slot${remaining > 1 ? 's' : ''} remaining — uploading first ${toUpload.length}.`, 'error');
    setUploading(true);
    setMsg(null);
    const newUrls: string[] = [];
    const skipped: string[] = [];
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      for (let i = 0; i < toUpload.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${toUpload.length}…`);
        const rawPath = `${user.id}/originals/${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const { error: uploadErr } = await supabase.storage
          .from('listing-photos')
          .upload(rawPath, toUpload[i], { upsert: false });
        if (uploadErr) { skipped.push(toUpload[i].name); continue; }

        setUploadProgress(`Processing ${i + 1} of ${toUpload.length}…`);
        const token = await getToken();
        const res = await fetch('/api/process-image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: rawPath }),
        });
        const data = await res.json();
        if (!res.ok) { skipped.push(toUpload[i].name); continue; }
        newUrls.push(data.medium);
      }

      if (newUrls.length === 0) {
        showMsg(skipped.length > 0 ? 'Photos were flagged and not uploaded.' : 'No photos were uploaded.', 'error');
        return;
      }

      setPendingPhotos((prev) => [...prev, ...newUrls]);
      const notice = skipped.length > 0
        ? `${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} added. ${skipped.length} skipped (flagged or failed). Save to apply.`
        : `${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} added. Click Save photos to apply.`;
      showMsg(notice);
    } catch (err: unknown) {
      showMsg((err as Error).message ?? 'Upload failed.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function handleSetCover(url: string) {
    setPendingPhotos((prev) => [url, ...prev.filter((p) => p !== url)]);
    setMsg(null);
  }

  function handleDelete(url: string) {
    if (pendingPhotos.length <= MIN_PHOTOS) { showMsg(`Minimum ${MIN_PHOTOS} photo required.`, 'error'); return; }
    setPendingPhotos((prev) => prev.filter((p) => p !== url));
    setMsg(null);
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: pendingPhotos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedPhotos(data.photos);
      setPendingPhotos(data.photos);
      showMsg('Photos saved.');
    } catch (err: unknown) {
      showMsg((err as Error).message ?? 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setPendingPhotos(savedPhotos);
    setMsg(null);
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">Photos</h2>
        <div className="flex items-center gap-2">
          {pendingPhotos.length < MAX_PHOTOS && (
            <label className={`cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-400 hover:text-brand-700 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? (uploadProgress || 'Uploading…') : `+ Add photos (${pendingPhotos.length}/25)`}
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
          {pendingPhotos.length >= MAX_PHOTOS && (
            <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400">25 photo limit reached</span>
          )}
          {isDirty && (
            <button
              onClick={handleDiscard}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-400 disabled:opacity-60"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save photos'}
          </button>
        </div>
      </div>

      {msg && (
        <p className={`mb-3 text-sm font-semibold ${msgType === 'error' ? 'text-red-600' : 'text-brand-700'}`}>{msg}</p>
      )}

      {isDirty && !msg && (
        <p className="mb-3 text-xs text-amber-600 font-medium">You have unsaved changes.</p>
      )}

      {pendingPhotos.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No photos yet. Add at least {MIN_PHOTOS} clean, watermark-free photo.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pendingPhotos.map((url, i) => (
            <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
              <Image src={url} alt={`Photo ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
              <button
                onClick={() => handleDelete(url)}
                aria-label="Remove photo"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {i === 0 ? (
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>
              ) : (
                <button
                  onClick={() => handleSetCover(url)}
                  aria-label="Set as cover"
                  className="absolute bottom-2 left-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 opacity-0 shadow transition hover:bg-brand-600 hover:text-white group-hover:opacity-100"
                >
                  Set cover
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
