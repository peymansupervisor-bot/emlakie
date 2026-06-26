'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddModeratorForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setMsg(''); setErr('');
    const res = await fetch('/api/admin/moderators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? 'Failed.'); }
    else { setMsg(`${email} added as moderator.`); setEmail(''); router.refresh(); }
    setBusy(false);
  }

  return (
    <form onSubmit={handleAdd} className="flex gap-2">
      <input
        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com" required
        className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
      />
      <button type="submit" disabled={busy}
        className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition disabled:opacity-60">
        {busy ? 'Adding…' : 'Add'}
      </button>
      {msg && <p className="self-center text-xs text-green-400">{msg}</p>}
      {err && <p className="self-center text-xs text-red-400">{err}</p>}
    </form>
  );
}
