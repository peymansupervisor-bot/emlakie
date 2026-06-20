'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    // Use SSR browser client so the session is stored in cookies,
    // making it visible to the server-side layout auth check.
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setBusy(false); return; }
    router.replace('/135265826');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">EMLAKIE</span>
          <p className="mt-1 text-sm font-semibold text-gray-400 uppercase tracking-widest">Moderator Portal</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl bg-gray-900 border border-gray-800 px-6 py-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500"
              placeholder="moderator@emlakie.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-400">{error}</p>}

          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-60 mt-2">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
