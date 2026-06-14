'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { enterDemo, sendEmailOtp, verifyEmailOtp } from '@/lib/landlord/client';

export default function LandlordLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await sendEmailOtp(email.trim().toLowerCase());
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await verifyEmailOtp(email.trim().toLowerCase(), code.trim());
      router.push('/landlord');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function onDemo() {
    enterDemo();
    router.push('/landlord');
  }

  const inputClass =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-lg outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600';

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Landlord sign in</h1>
      <p className="mt-2 text-gray-600">
        {step === 'email'
          ? "Enter your email and we'll send you a sign-in code."
          : `We sent a 6-digit code to ${email}.`}
      </p>

      {step === 'email' ? (
        <form onSubmit={onSendCode} className="mt-8 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            autoComplete="email"
            required
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Email me a code'}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerify} className="mt-8 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            aria-label="Verification code"
            autoComplete="one-time-code"
            required
            className={`${inputClass} tracking-[0.4em]`}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? 'Verifying…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-sm font-semibold text-gray-600 hover:text-brand-600"
          >
            Use a different email
          </button>
        </form>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-10 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-600">Just want a look around first?</p>
        <button
          onClick={onDemo}
          className="mt-2 font-semibold text-brand-600 hover:text-brand-700"
        >
          Preview the demo dashboard →
        </button>
      </div>
    </div>
  );
}
