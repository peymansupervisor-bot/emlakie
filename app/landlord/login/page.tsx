'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { enterDemo, signInWithPassword, signUpWithPassword, resetPassword } from '@/lib/landlord/client';

type Step = 'login' | 'signup' | 'forgot' | 'forgot-sent';

export default function LandlordLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const inputClass =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600';

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await signInWithPassword(email.trim().toLowerCase(), password);
      router.push('/landlord');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally { setBusy(false); }
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await signUpWithPassword(email.trim().toLowerCase(), password);
      setMessage('Account created! Check your email to confirm, then sign in.');
      setStep('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally { setBusy(false); }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await resetPassword(email.trim().toLowerCase());
      setStep('forgot-sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    } finally { setBusy(false); }
  }

  function onDemo() { enterDemo(); router.push('/landlord'); }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">

      {/* LOGIN */}
      {step === 'login' && (
        <>
          <h1 className="text-3xl font-extrabold text-gray-900">Landlord sign in</h1>
          <p className="mt-2 text-gray-500">Sign in to manage your listings.</p>
          {message && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" autoComplete="email" required className={inputClass} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" autoComplete="current-password" required className={inputClass} />
            <div className="text-right">
              <button type="button" onClick={() => { setError(''); setStep('forgot'); }}
                className="text-sm text-green-600 hover:underline">
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={busy}
              className="w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#16a34a' }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{' '}
            <button onClick={() => { setError(''); setStep('signup'); }}
              className="font-semibold text-green-600 hover:underline">Create one</button>
          </p>
        </>
      )}

      {/* SIGN UP */}
      {step === 'signup' && (
        <>
          <h1 className="text-3xl font-extrabold text-gray-900">Create account</h1>
          <p className="mt-2 text-gray-500">List your rentals on Emlakie for free.</p>
          <form onSubmit={onSignup} className="mt-8 space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" autoComplete="email" required className={inputClass} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 characters)" autoComplete="new-password" minLength={8} required className={inputClass} />
            <button type="submit" disabled={busy}
              className="w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#16a34a' }}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={() => { setError(''); setStep('login'); }}
              className="font-semibold text-green-600 hover:underline">Sign in</button>
          </p>
        </>
      )}

      {/* FORGOT PASSWORD */}
      {step === 'forgot' && (
        <>
          <h1 className="text-3xl font-extrabold text-gray-900">Reset password</h1>
          <p className="mt-2 text-gray-500">Enter your email and we'll send you a reset link.</p>
          <form onSubmit={onForgot} className="mt-8 space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" autoComplete="email" required className={inputClass} />
            <button type="submit" disabled={busy}
              className="w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#16a34a' }}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <p className="mt-6 text-center text-sm text-gray-500">
            <button onClick={() => { setError(''); setStep('login'); }}
              className="font-semibold text-green-600 hover:underline">Back to sign in</button>
          </p>
        </>
      )}

      {/* FORGOT SENT */}
      {step === 'forgot-sent' && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✉️</div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-500">
            We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
          </p>
          <button onClick={() => { setError(''); setStep('login'); }} className="mt-8 font-semibold text-green-600 hover:underline">
            Back to sign in
          </button>
        </>
      )}

      <div className="mt-10 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-500">Just want a look around first?</p>
        <button onClick={onDemo} className="mt-2 font-semibold text-green-600 hover:underline">
          Preview the demo dashboard →
        </button>
      </div>
    </div>
  );
}
