'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPassword, signUpWithPassword, resetPassword, signInWithOAuth, updateProfile } from '@/lib/landlord/client';
import { trackEvent } from '@/lib/analytics';

type Step = 'choice' | 'login' | 'signup' | 'forgot' | 'forgot-sent';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Where to redirect after successful sign-in (default: /landlord) */
  next?: string;
  /** Which step to show first (default: 'choice') */
  initialStep?: Step;
  /** Custom title shown on the choice screen */
  title?: string;
  /** Custom subtitle shown on the choice screen */
  subtitle?: string;
  /** Custom label for the primary "create account" button on the choice screen */
  primaryLabel?: string;
}

const inputClass = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const btnPrimary = 'w-full rounded-xl bg-brand-700 py-3 text-base font-bold text-white transition hover:bg-brand-800 disabled:opacity-60';
const btnOutline = 'w-full rounded-xl border border-gray-300 py-3 text-base font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60';

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
    </svg>
  );
}

function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('1') && d.length >= 11) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length > 6) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  if (d.length > 0) return `(${d}`;
  return '';
}

export default function SignInModal({
  open,
  onClose,
  next = '/landlord',
  initialStep = 'choice',
  title,
  subtitle,
  primaryLabel,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(initialStep);
      setError('');
      setMessage('');
    }
  }, [open, initialStep]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus first element + full focus trap
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;

    const getFocusable = () => Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    // Focus first interactive element
    const first = getFocusable()[0];
    first?.focus();

    // Trap Tab/Shift-Tab inside the panel
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl) { e.preventDefault(); lastEl?.focus(); }
      } else {
        if (document.activeElement === lastEl) { e.preventDefault(); firstEl?.focus(); }
      }
    }

    panel.addEventListener('keydown', trapFocus);
    return () => panel.removeEventListener('keydown', trapFocus);
  }, [open, step]);

  if (!open) return null;

  function go(s: Step) { setError(''); setMessage(''); setStep(s); }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await signInWithPassword(email.trim().toLowerCase(), password);
      onClose();
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally { setBusy(false); }
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) { setError('First name is required.'); return; }
    if (!lastName.trim())  { setError('Last name is required.'); return; }
    if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(phone)) { setError('Enter phone as (555) 000-0000.'); return; }
    setBusy(true); setError('');
    try {
      await signUpWithPassword(email.trim().toLowerCase(), password);
      await updateProfile({ first_name: firstName.trim(), last_name: lastName.trim(), phone });
      trackEvent('sign_up', { method: 'password' });
      setMessage('Account created! Check your email to confirm, then sign in.');
      go('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally { setBusy(false); }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await resetPassword(email.trim().toLowerCase());
      go('forgot-sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    } finally { setBusy(false); }
  }

  async function onOAuth(provider: 'google' | 'facebook' | 'apple') {
    setBusy(true); setError('');
    try { await signInWithOAuth(provider); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not sign in.'); setBusy(false); }
  }

  const PasswordField = ({ autoComplete, label, id }: { autoComplete: string; label: string; id: string }) => (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={autoComplete}
          minLength={8}
          required
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );

  const SocialDivider = () => (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
      <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400 uppercase tracking-widest">or</span></div>
    </div>
  );

  const SocialButtons = () => (
    <div className="flex flex-col gap-2.5">
      {([
        { provider: 'google', label: 'Continue with Google', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
        { provider: 'apple', label: 'Continue with Apple', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
        { provider: 'facebook', label: 'Continue with Facebook', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg> },
      ] as const).map(({ provider, label, icon }) => (
        <button
          key={provider}
          type="button"
          disabled={busy}
          onClick={() => onOAuth(provider)}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );

  const LegalNote = () => (
    <p className="mt-3 text-center text-xs text-gray-500">
      By continuing, you agree to our{' '}
      <a href="/terms" className="underline hover:text-gray-700" onClick={onClose}>Terms</a>{' '}and{' '}
      <a href="/privacy" className="underline hover:text-gray-700" onClick={onClose}>Privacy Policy</a>.
    </p>
  );

  // Derive a heading id used for aria-labelledby — stable across all steps
  const headingId = 'modal-heading';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-7">

          {/* ── Account choice ──────────────────────────────────────────────── */}
          {step === 'choice' && (
            <div>
              <div className="mb-6">
                <h2 id={headingId} className="text-2xl font-extrabold text-gray-900">
                  {title ?? 'Welcome to EMLAKIE'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {subtitle ?? 'List your rental for free'}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => go('signup')}
                  className={btnPrimary}
                >
                  {primaryLabel ?? 'Create Account — It\'s Free'}
                </button>
                <button
                  type="button"
                  onClick={() => go('login')}
                  className={btnOutline}
                >
                  Already have an account? Sign In
                </button>
              </div>

              <SocialDivider />
              <SocialButtons />
              <LegalNote />
            </div>
          )}

          {/* ── Login ───────────────────────────────────────────────────────── */}
          {step === 'login' && (
            <div>
              <h2 id={headingId} className="mb-1 text-2xl font-extrabold text-gray-900">Landlord Sign In</h2>
              <p className="mb-6 text-sm text-gray-600">Sign in to manage your listings</p>

              {message && (
                <p className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</p>
              )}

              <form onSubmit={onLogin} className="space-y-4">
                <div>
                  <label htmlFor="modal-email" className={labelClass}>Email address</label>
                  <input
                    id="modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>
                <PasswordField autoComplete="current-password" label="Password" id="modal-password" />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => go('forgot')}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={busy} className={btnPrimary}>
                  {busy ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              {error && (
                <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <SocialDivider />
              <SocialButtons />
              <LegalNote />

              <p className="mt-5 text-center text-sm text-gray-600">
                No account?{' '}
                <button type="button" onClick={() => go('signup')} className="font-semibold text-brand-600 hover:underline">
                  Create one free
                </button>
              </p>
            </div>
          )}

          {/* ── Sign up ─────────────────────────────────────────────────────── */}
          {step === 'signup' && (
            <div>
              <h2 id={headingId} className="mb-1 text-2xl font-extrabold text-gray-900">Create Account</h2>
              <p className="mb-6 text-sm text-gray-600">List your rentals on EMLAKIE for free</p>

              <form onSubmit={onSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="modal-first-name" className={labelClass}>First name</label>
                    <input
                      id="modal-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-last-name" className={labelClass}>Last name</label>
                    <input
                      id="modal-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="modal-phone" className={labelClass}>Phone number</label>
                  <input
                    id="modal-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    onKeyDown={(e) => { if (e.key.length === 1 && !/[\d]/.test(e.key)) e.preventDefault(); }}
                    placeholder="(555) 000-0000"
                    autoComplete="tel"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="modal-signup-email" className={labelClass}>Email address</label>
                  <input
                    id="modal-signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>
                <PasswordField autoComplete="new-password" label="Password (min 8 characters)" id="modal-signup-password" />
                <button type="submit" disabled={busy} className={btnPrimary}>
                  {busy ? 'Creating account…' : 'Create Account — It\'s Free'}
                </button>
              </form>

              {error && (
                <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <SocialDivider />
              <SocialButtons />
              <LegalNote />

              <p className="mt-5 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button type="button" onClick={() => go('login')} className="font-semibold text-brand-600 hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* ── Forgot password ─────────────────────────────────────────────── */}
          {step === 'forgot' && (
            <div>
              <h2 id={headingId} className="mb-1 text-2xl font-extrabold text-gray-900">Reset Password</h2>
              <p className="mb-6 text-sm text-gray-600">Enter your email and we&apos;ll send you a reset link.</p>

              <form onSubmit={onForgot} className="space-y-4">
                <div>
                  <label htmlFor="modal-forgot-email" className={labelClass}>Email address</label>
                  <input
                    id="modal-forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>
                <button type="submit" disabled={busy} className={btnPrimary}>
                  {busy ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              {error && (
                <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <p className="mt-5 text-center text-sm text-gray-600">
                <button type="button" onClick={() => go('login')} className="font-semibold text-brand-600 hover:underline">
                  ← Back to sign in
                </button>
              </p>
            </div>
          )}

          {/* ── Forgot sent ─────────────────────────────────────────────────── */}
          {step === 'forgot-sent' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-3xl" aria-hidden="true">
                ✉️
              </div>
              <h2 id={headingId} className="text-2xl font-extrabold text-gray-900">Check your email</h2>
              <p className="mt-2 text-sm text-gray-600">
                We sent a reset link to <strong>{email}</strong>.
              </p>
              <button type="button" onClick={() => go('login')} className="mt-8 font-semibold text-brand-600 hover:underline">
                ← Back to sign in
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
