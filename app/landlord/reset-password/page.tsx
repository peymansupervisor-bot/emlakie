'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 8 characters)"
            autoComplete="new-password"
            minLength={8}
            required
            className={`${inputClass} pr-12`}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
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
