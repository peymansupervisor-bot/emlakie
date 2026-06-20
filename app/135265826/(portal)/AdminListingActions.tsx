'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUS_OPTIONS = ['active', 'suspended', 'expired'];

export default function AdminListingActions({ listingId, currentStatus }: { listingId: string; currentStatus: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: string) {
    if (!confirm(`Change status to "${status}"?`)) return;
    setBusy(true);
    await fetch(`/api/admin/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  async function deleteListing() {
    if (!confirm('Permanently delete this listing? This cannot be undone.')) return;
    setBusy(true);
    await fetch(`/api/admin/listings/${listingId}`, { method: 'DELETE' });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        disabled={busy}
        value={currentStatus}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-xs text-white outline-none focus:border-brand-500 disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button
        onClick={deleteListing}
        disabled={busy}
        className="rounded-lg bg-red-900 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-800 transition disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
