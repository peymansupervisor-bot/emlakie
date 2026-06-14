'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push('/landlord');
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Set new password</h1>
      <p className="mt-2 text-gray-500">Choose a strong password for your account.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#16a34a' }}
        >
          {busy ? 'Saving…' : 'Save new password'}
        </button>
      </form>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
