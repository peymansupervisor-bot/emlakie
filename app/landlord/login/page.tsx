'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { enterDemo, sendOtp, verifyOtp } from '@/lib/landlord/client';

export default function LandlordLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function normalizePhone(input: string): string {
    const digits = input.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return input.startsWith('+') ? input : `+${digits}`;
  }

  async function onSendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await sendOtp(normalizePhone(phone));
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
      await verifyOtp(normalizePhone(phone), code.trim());
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
        {step === 'phone'
          ? 'Enter your phone number and we’ll text you a sign-in code.'
          : `We sent a 6-digit code to ${phone}.`}
      </p>

      {step === 'phone' ? (
        <form onSubmit={onSendCode} className="mt-8 space-y-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(661) 555-0123"
            aria-label="Phone number"
            autoComplete="tel"
            required
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Text me a code'}
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
            onClick={() => setStep('phone')}
            className="w-full text-sm font-semibold text-gray-600 hover:text-brand-600"
          >
            Use a different number
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
