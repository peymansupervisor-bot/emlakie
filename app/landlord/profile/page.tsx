'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile } from '@/lib/landlord/client';

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
  const [step, setStep] = useState<'info' | 'done'>('info');
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
      setEmail(p.email ?? '');
      setAccountId(p.account_id ?? '');
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) { setError('First name is required.'); return; }
    if (!form.last_name.trim()) { setError('Last name is required.'); return; }
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setError('');
    setBusy(true);
    try {
      await updateProfile({ ...form });
      setStep('done');
      setTimeout(() => router.push('/landlord'), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile.');
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
              <label htmlFor="profile-first-name" className={labelCls}>First name *</label>
              <input id="profile-first-name" className={inputCls} value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                placeholder="Jane" />
            </div>
            <div>
              <label htmlFor="profile-last-name" className={labelCls}>Last name *</label>
              <input id="profile-last-name" className={inputCls} value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                placeholder="Smith" />
            </div>
          </div>

          <div>
            <label htmlFor="profile-phone" className={labelCls}>Phone number *</label>
            <input id="profile-phone" className={inputCls} type="tel" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
              placeholder="(555) 000-0000" />
            <p className="mt-1 text-xs text-gray-500">Shared with tenants who inquire about your listings.</p>
          </div>

          {email && (
            <div>
              <label htmlFor="profile-email" className={labelCls}>Email</label>
              <input id="profile-email" className={`${inputCls} bg-gray-50 text-gray-500`} value={email} disabled />
            </div>
          )}
          {accountId && (
            <div>
              <label htmlFor="profile-account-id" className={labelCls}>Account ID</label>
              <input id="profile-account-id" className={`${inputCls} bg-gray-50 text-gray-500`} value={accountId} disabled />
            </div>
          )}

          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}

    </div>
  );
}
