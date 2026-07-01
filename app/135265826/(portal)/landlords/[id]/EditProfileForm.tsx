'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

function formatPhoneInput(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('1') && d.length >= 11) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length > 0) return `(${d}`;
  return '';
}

export default function EditProfileForm({
  landlordId,
  firstName,
  lastName,
  phone,
}: {
  landlordId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [first, setFirst] = useState(firstName ?? '');
  const [last, setLast] = useState(lastName ?? '');
  const [phoneInput, setPhoneInput] = useState(formatPhoneInput(phone ?? ''));

  function cancel() {
    setEditing(false);
    setError('');
    setFirst(firstName ?? '');
    setLast(lastName ?? '');
    setPhoneInput(formatPhoneInput(phone ?? ''));
  }

  async function save() {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/admin/landlords/${landlordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit_profile', first_name: first, last_name: last, phone: phoneInput }),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: 'Failed to save' }));
      setError(msg ?? 'Failed to save');
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-gray-400 hover:text-white underline transition"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="mt-3 flex max-w-sm flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800/50 p-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">First Name</label>
          <input
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">Last Name</label>
          <input
            value={last}
            onChange={(e) => setLast(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white outline-none focus:border-green-500"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">Phone</label>
        <input
          value={phoneInput}
          onChange={(e) => setPhoneInput(formatPhoneInput(e.target.value))}
          placeholder="(555) 000-0000"
          className="w-full rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white outline-none focus:border-green-500"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={cancel}
          disabled={busy}
          className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
