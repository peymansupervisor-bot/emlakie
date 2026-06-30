'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LandlordRowActions({ id, noProfile }: { id: string; noProfile: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm('Permanently delete this account and all their listings? This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure?')) return;
    setBusy(true);
    const res = await fetch(`/api/admin/landlords/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Unknown error' }));
      alert(`Delete failed: ${error}`);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/135265826/landlords/${id}`}
        className="inline-block rounded-lg bg-gray-800 border border-gray-700 px-3 py-1 text-xs font-semibold text-gray-200 hover:bg-gray-700 hover:text-white transition"
      >
        View →
      </Link>
      {noProfile && (
        <button
          onClick={handleDelete}
          disabled={busy}
          className="rounded-lg bg-red-900 border border-red-700 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-700 hover:text-white transition disabled:opacity-50"
        >
          {busy ? '…' : 'Delete'}
        </button>
      )}
    </div>
  );
}
