'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { enterDemo, signInWithPassword, signUpWithPassword, resetPassword } from '@/lib/landlord/client';

type Step = 'login' | 'signup' | 'forgot' | 'forgot-sent';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
);

const inputClass = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600';
const btnClass = 'w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60';

export default function LandlordLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

  const passwordField = (autoComplete: string, placeholder: string) => (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={8}
        required
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );

  const steps = [
    { title: 'Post your property', body: 'Add photos, set your rent, and publish in under five minutes — right from your phone.' },
    { title: 'Get matched applicants', body: 'Our AI scores every application against your listing so the best-fit tenants rise to the top.' },
    { title: 'Chat and decide', body: 'Message applicants directly, schedule showings, and approve your tenant — all in one place.' },
  ];

  return (
    <>
    {/* Hero */}
    <section className="bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Rent out your property with ease
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Post your property for free, get AI-matched applicants, and talk to tenants directly. No listing fees, no commissions.
        </p>
      </div>
    </section>

    {/* How it works */}
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <h2 className="text-center text-2xl font-extrabold text-gray-900">How it works</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="rounded-2xl border border-gray-200 p-6 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
              {i + 1}
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">{step.title}</h3>
            <p className="mt-2 text-gray-600">{step.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Login / signup form */}
    <div className="mx-auto flex max-w-md flex-col px-4 pb-16 sm:px-6">

      {/* LOGIN */}
      {step === 'login' && (
        <>
          <h1 className="text-3xl font-extrabold text-gray-900">Landlord Sign In to Manage Your Listings</h1>
          {message && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" autoComplete="email" required className={inputClass} />
            {passwordField('current-password', 'Password')}
            <div className="text-right">
              <button type="button" onClick={() => { setError(''); setStep('forgot'); }}
                className="text-sm text-green-600 hover:underline">
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={busy} className={btnClass} style={{ backgroundColor: '#16a34a' }}>
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
            {passwordField('new-password', 'Password (min 8 characters)')}
            <button type="submit" disabled={busy} className={btnClass} style={{ backgroundColor: '#16a34a' }}>
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
            <button type="submit" disabled={busy} className={btnClass} style={{ backgroundColor: '#16a34a' }}>
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
    </>
  );
}
