'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { signInWithPassword, signUpWithPassword, resetPassword, signInWithOAuth, updateProfile } from '@/lib/landlord/client';

type Step = 'login' | 'signup' | 'forgot' | 'forgot-sent';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
);

const inputClass = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600';
const btnClass = 'w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60';

function formatPhone(raw: string) {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length >= 11) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length > 6) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length > 3) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  if (digits.length > 0) return `(${digits}`;
  return '';
}

function LandlordLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/landlord';
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await signInWithPassword(email.trim().toLowerCase(), password);
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally { setBusy(false); }
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!signupFirstName.trim()) { setError('First name is required.'); return; }
    if (!signupLastName.trim())  { setError('Last name is required.'); return; }
    const digits = signupPhone.replace(/\D/g, '');
    if (digits.length !== 10)    { setError('Enter a valid 10-digit phone number.'); return; }
    setBusy(true); setError('');
    try {
      await signUpWithPassword(email.trim().toLowerCase(), password);
      // Save name + phone immediately so the profile is complete from day one
      await updateProfile({ first_name: signupFirstName.trim(), last_name: signupLastName.trim(), phone: signupPhone });
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

  function onDemo() { router.push('/rentals'); }

  async function onOAuth(provider: 'google' | 'facebook' | 'apple') {
    setBusy(true); setError('');
    try { await signInWithOAuth(provider); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not sign in.'); setBusy(false); }
  }

  const SocialButtons = () => (
    <div className="mt-6">
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-gray-400">or continue with</span></div>
      </div>
      <div className="flex flex-col gap-3">
        <button type="button" disabled={busy} onClick={() => onOAuth('google')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <button type="button" disabled={busy} onClick={() => onOAuth('apple')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Continue with Apple
        </button>
        <button type="button" disabled={busy} onClick={() => onOAuth('facebook')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
            <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          Continue with Facebook
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-gray-400">
        By signing in, you agree to our{' '}
        <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>{' '}
        and{' '}
        <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
      </p>
    </div>
  );

  const passwordField = (autoComplete: string, placeholder: string, inputId: string) => (
    <div className="relative">
      <input
        id={inputId}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete={autoComplete}
        minLength={8}
        required
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"
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
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          {message && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" aria-label="Email address" autoComplete="email" required className={inputClass} />
            {passwordField('current-password', 'Password', 'login-password')}
            <div className="text-right">
              <button type="button" onClick={() => { setError(''); setStep('forgot'); }}
                className="text-sm text-green-600 hover:underline">
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={busy} className={btnClass} style={{ backgroundColor: '#16a34a' }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="text-center text-xs text-gray-400">
              By signing in, you agree to our{' '}
              <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
          </form>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <SocialButtons />
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
          <h2 className="text-3xl font-extrabold text-gray-900">Create account</h2>
          <p className="mt-2 text-gray-500">List your rentals on EMLAKIE for free.</p>
          <form onSubmit={onSignup} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" value={signupFirstName}
                onChange={(e) => setSignupFirstName(e.target.value)}
                placeholder="First name *" aria-label="First name" autoComplete="given-name" required
                className={inputClass}
              />
              <input
                type="text" value={signupLastName}
                onChange={(e) => setSignupLastName(e.target.value)}
                placeholder="Last name *" aria-label="Last name" autoComplete="family-name" required
                className={inputClass}
              />
            </div>
            <input
              type="tel" value={signupPhone}
              onChange={(e) => setSignupPhone(formatPhone(e.target.value))}
              placeholder="Phone number * (555) 000-0000" aria-label="Phone number" autoComplete="tel" required
              className={inputClass}
            />
            <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address *" aria-label="Email address" autoComplete="email" required className={inputClass} />
            {passwordField('new-password', 'Password * (min 8 characters)', 'signup-password')}
            <button type="submit" disabled={busy} className={btnClass} style={{ backgroundColor: '#16a34a' }}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
            <p className="text-center text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
          </form>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <SocialButtons />
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
          <h2 className="text-3xl font-extrabold text-gray-900">Reset password</h2>
          <p className="mt-2 text-gray-500">Enter your email and we'll send you a reset link.</p>
          <form onSubmit={onForgot} className="mt-8 space-y-4">
            <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" aria-label="Email address" autoComplete="email" required className={inputClass} />
            <button type="submit" disabled={busy} className={btnClass} style={{ backgroundColor: '#16a34a' }}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
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
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Check your email</h2>
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
          Browse listings as a tenant →
        </button>
      </div>
    </div>
    </>
  );
}

export default function LandlordLoginPage() {
  return (
    <Suspense>
      <LandlordLoginInner />
    </Suspense>
  );
}
