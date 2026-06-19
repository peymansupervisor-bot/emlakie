'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, sendPhoneVerification, updateProfile, verifyPhoneOtp } from '@/lib/landlord/client';

const inputCls = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-0';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

function formatPhone(raw: string) {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length >= 11) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length > 6) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length > 3) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  if (digits.length > 0) return `(${digits}`;
  return '';
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [email, setEmail] = useState('');
  const [accountId, setAccountId] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [originalPhone, setOriginalPhone] = useState('');
  const [otp, setOtp] = useState('');

  // 'info' = filling name/phone, 'otp' = entering code, 'done' = saved
  const [step, setStep] = useState<'info' | 'otp' | 'done'>('info');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile().then((p) => {
      if (!p) return;
      let digits = (p.phone ?? '').replace(/\D/g, '');
      if (digits.startsWith('1') && digits.length >= 11) digits = digits.slice(1);
      digits = digits.slice(0, 10);
      const phone = digits.length === 10
        ? `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
        : digits;
      const nameParts = (p.display_name ?? '').trim().split(' ');
      setForm({
        first_name: p.first_name ?? nameParts[0] ?? '',
        last_name: p.last_name ?? nameParts.slice(1).join(' ') ?? '',
        phone,
      });
      setOriginalPhone(phone);
      setPhoneVerified(p.phone_verified ?? false);
      setEmail(p.email ?? '');
      setAccountId(p.account_id ?? '');
    });
  }, []);

  const phoneChanged = form.phone !== originalPhone;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) { setError('First name is required.'); return; }
    if (!form.last_name.trim()) { setError('Last name is required.'); return; }
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setError('');

    // If phone changed or not yet verified, send OTP to verify
    if (phoneChanged || !phoneVerified) {
      setBusy(true);
      try {
        await sendPhoneVerification(form.phone);
        setStep('otp');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not send verification code.');
      } finally {
        setBusy(false);
      }
      return;
    }

    // Phone unchanged and already verified — just save
    setBusy(true);
    try {
      await updateProfile({ ...form, phone_verified: true });
      setStep('done');
      setTimeout(() => router.push('/landlord'), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.trim().length < 4) { setError('Enter the 6-digit code from your SMS.'); return; }
    setError('');
    setBusy(true);
    try {
      await verifyPhoneOtp(form.phone, otp.trim());
      await updateProfile({ ...form, phone_verified: true });
      setStep('done');
      setTimeout(() => router.push('/landlord'), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-extrabold text-gray-900">Complete your profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Required before you can list or manage properties. Your name and phone are shown to interested tenants.
      </p>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      {step === 'done' && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">Profile saved! Redirecting…</p>}

      {step === 'info' && (
        <form onSubmit={handleSave} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First name *</label>
              <input className={inputCls} value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                placeholder="Jane" />
            </div>
            <div>
              <label className={labelCls}>Last name *</label>
              <input className={inputCls} value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                placeholder="Smith" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Phone number *</label>
            <div className="relative">
              <input className={inputCls} type="tel" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                placeholder="(818) 300-3005" />
              {phoneVerified && !phoneChanged && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Shared with tenants who inquire about your listings.</p>
          </div>

          {email && (
            <div>
              <label className={labelCls}>Email</label>
              <input className={`${inputCls} bg-gray-50 text-gray-500`} value={email} disabled />
            </div>
          )}
          {accountId && (
            <div>
              <label className={labelCls}>Account ID</label>
              <input className={`${inputCls} bg-gray-50 text-gray-500`} value={accountId} disabled />
            </div>
          )}

          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? 'Sending code…' : (phoneVerified && !phoneChanged) ? 'Save profile' : 'Continue — verify phone'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
          <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
            A 6-digit verification code was sent to <strong>{form.phone}</strong>. Enter it below.
          </div>
          <div>
            <label className={labelCls}>Verification code</label>
            <input
              className={`${inputCls} tracking-widest text-center text-lg font-bold`}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              autoFocus
            />
          </div>
          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? 'Verifying…' : 'Verify & save profile'}
          </button>
          <button type="button" onClick={() => { setStep('info'); setOtp(''); setError(''); }}
            className="w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">
            ← Back
          </button>
        </form>
      )}
    </div>
  );
}
