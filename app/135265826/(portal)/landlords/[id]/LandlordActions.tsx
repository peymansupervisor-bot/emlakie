'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LandlordActions({ landlordId, isBanned }: { landlordId: string; isBanned: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function suspend() {
    if (!confirm('Suspend this landlord? Their account will be locked and all active listings suspended.')) return;
    setBusy(true);
    await fetch(`/api/admin/landlords/${landlordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'suspend' }),
    });
    setBusy(false);
    router.refresh();
  }

  async function unsuspend() {
    if (!confirm('Unsuspend this landlord? Their account will be restored and suspended listings reactivated.')) return;
    setBusy(true);
    await fetch(`/api/admin/landlords/${landlordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unsuspend' }),
    });
    setBusy(false);
    router.refresh();
  }

  async function deleteAccount() {
    if (!confirm('Permanently delete this landlord account and ALL their listings? This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure? Type OK to confirm — this is irreversible.')) return;
    setBusy(true);
    await fetch(`/api/admin/landlords/${landlordId}`, { method: 'DELETE' });
    setBusy(false);
    router.push('/135265826/landlords');
  }

  return (
    <div className="flex items-center gap-3">
      {isBanned ? (
        <button
          onClick={unsuspend}
          disabled={busy}
          className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Unsuspend Account'}
        </button>
      ) : (
        <button
          onClick={suspend}
          disabled={busy}
          className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Suspend Account'}
        </button>
      )}
      <button
        onClick={deleteAccount}
        disabled={busy}
        className="rounded-xl bg-red-800 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-700 transition disabled:opacity-50"
      >
        {busy ? 'Working…' : 'Delete Account'}
      </button>
    </div>
  );
}
