'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const sb = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setMsg('');
    if (next.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (next !== confirm) { setErr('Passwords do not match.'); return; }
    setBusy(true);

    // Re-authenticate to verify current password
    const { data: { user } } = await sb.auth.getUser();
    if (!user?.email) { setErr('Session error. Please sign in again.'); setBusy(false); return; }

    const { error: signInErr } = await sb.auth.signInWithPassword({ email: user.email, password: current });
    if (signInErr) { setErr('Current password is incorrect.'); setBusy(false); return; }

    const { error: updateErr } = await sb.auth.updateUser({ password: next });
    if (updateErr) { setErr(updateErr.message); setBusy(false); return; }

    setMsg('Password changed successfully.');
    setCurrent(''); setNext(''); setConfirm('');
    setBusy(false);
    setTimeout(() => { setOpen(false); setMsg(''); }, 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition"
      >
        Change Password
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-gray-900 border border-gray-700 px-6 py-7">
            <h2 className="text-base font-bold text-white mb-5">Change Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Current Password</label>
                <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-white outline-none focus:border-green-500"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">New Password</label>
                <input type="password" value={next} onChange={e => setNext(e.target.value)} required
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-white outline-none focus:border-green-500"
                  placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Confirm New Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-white outline-none focus:border-green-500"
                  placeholder="••••••••" />
              </div>

              {err && <p className="text-sm text-red-400 font-medium">{err}</p>}
              {msg && <p className="text-sm text-green-400 font-medium">{msg}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setOpen(false); setErr(''); setMsg(''); }}
                  className="flex-1 rounded-xl border border-gray-700 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition">
                  Cancel
                </button>
                <button type="submit" disabled={busy}
                  className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-60">
                  {busy ? 'Saving…' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
