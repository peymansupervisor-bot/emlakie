'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminReportActions({
  reportId, listingId, reviewed,
}: { reportId: string; listingId: string; reviewed: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function markReviewed() {
    setBusy(true);
    await fetch(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewed: true }),
    });
    setBusy(false);
    router.refresh();
  }

  async function suspendListing() {
    if (!confirm('Suspend this listing? It will be hidden from public search.')) return;
    setBusy(true);
    await Promise.all([
      fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' }),
      }),
      fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: true }),
      }),
    ]);
    setBusy(false);
    router.refresh();
  }

  async function deleteListing() {
    if (!confirm('Permanently delete this listing and mark report reviewed?')) return;
    setBusy(true);
    await Promise.all([
      fetch(`/api/admin/listings/${listingId}`, { method: 'DELETE' }),
      fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: true }),
      }),
    ]);
    setBusy(false);
    router.refresh();
  }

  if (reviewed) {
    return <span className="text-xs text-gray-600">Done</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={markReviewed} disabled={busy}
        className="rounded-lg bg-gray-700 px-2 py-1 text-xs font-semibold text-gray-300 hover:bg-gray-600 transition disabled:opacity-50">
        Dismiss
      </button>
      <button onClick={suspendListing} disabled={busy}
        className="rounded-lg bg-amber-900 px-2 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-800 transition disabled:opacity-50">
        Suspend
      </button>
      <button onClick={deleteListing} disabled={busy}
        className="rounded-lg bg-red-900 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-800 transition disabled:opacity-50">
        Delete
      </button>
    </div>
  );
}
