'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, updateProfile } from '@/lib/landlord/client';

const inputCls = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-0';
const disabledCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500';
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
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile().then(async (p) => {
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
        last_name:  p.last_name  ?? nameParts.slice(1).join(' ') ?? '',
        phone,
      });
      setEmail(p.email ?? '');

      // Auto-heal: if the trigger failed to assign an account ID, request one now
      if (!p.account_id) {
        try {
          const res = await fetch('/api/landlord/assign-account-id', { method: 'POST' });
          const json = await res.json();
          setAccountId(json.account_id ?? '');
        } catch {
          // leave blank — profile page will show the contact support message
        }
      } else {
        setAccountId(p.account_id);
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) { setError('First name is required.'); return; }
    if (!form.last_name.trim())  { setError('Last name is required.'); return; }
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setError('');
    setBusy(true);
    try {
      await updateProfile({ ...form });
      setSaved(true);
      setTimeout(() => router.push('/landlord'), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  }

  const missingFields = [
    !email       && 'email address',
    !accountId   && 'account ID',
    !form.first_name && 'first name',
    !form.last_name  && 'last name',
    !form.phone      && 'phone number',
  ].filter(Boolean);

  const hasSystemFieldMissing = !email || !accountId;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-extrabold text-gray-900">Your profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        All five fields are required before you can list or manage properties.
      </p>

      {missingFields.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800">Profile incomplete</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Missing: {missingFields.join(', ')}.
          </p>
        </div>
      )}

      {hasSystemFieldMissing && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-800">Account setup issue</p>
          <p className="text-sm text-red-700 mt-1">
            Your {!email ? 'email address' : 'account ID'} was not assigned during signup.
            Please contact support so we can fix this before you can use the portal.
          </p>
        </div>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      {saved && <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">Profile saved! Redirecting…</p>}

      <form onSubmit={handleSave} className="mt-8 space-y-5">
        {/* System fields — read-only */}
        <div>
          <label className={labelCls}>
            Email address <span className="text-gray-400 font-normal">(from your account)</span>
          </label>
          {email
            ? <p className={disabledCls}>{email}</p>
            : <p className={`${disabledCls} text-red-400`}>Not set — contact support</p>}
        </div>

        <div>
          <label className={labelCls}>
            Account ID <span className="text-gray-400 font-normal">(assigned automatically)</span>
          </label>
          {accountId
            ? <p className={`${disabledCls} font-mono`}>{accountId}</p>
            : <p className={`${disabledCls} text-red-400`}>Not assigned yet — contact support</p>}
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-first-name" className={labelCls}>First name *</label>
            <input
              id="profile-first-name"
              className={inputCls}
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              onBlur={(e) => setForm((f) => ({ ...f, first_name: e.target.value.trim().replace(/\b\w/g, (c) => c.toUpperCase()) }))}
              placeholder="Jane"
            />
          </div>
          <div>
            <label htmlFor="profile-last-name" className={labelCls}>Last name *</label>
            <input
              id="profile-last-name"
              className={inputCls}
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              onBlur={(e) => setForm((f) => ({ ...f, last_name: e.target.value.trim().replace(/\b\w/g, (c) => c.toUpperCase()) }))}
              placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <label htmlFor="profile-phone" className={labelCls}>Phone number *</label>
          <input
            id="profile-phone"
            className={inputCls}
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
            placeholder="(555) 000-0000"
          />
          <p className="mt-1 text-xs text-gray-500">Shown to tenants who inquire about your listings.</p>
        </div>

        <button
          type="submit"
          disabled={busy || hasSystemFieldMissing}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Saving…' : 'Save profile'}
        </button>

        {hasSystemFieldMissing && (
          <p className="text-xs text-center text-gray-400">
            Saving is disabled until your account is fixed by support.
          </p>
        )}
      </form>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="text-sm font-semibold text-gray-700">Security</h2>
        <p className="mt-1 text-xs text-gray-500">Update the password for your account.</p>
        <Link
          href="/landlord/reset-password"
          className="mt-3 inline-block rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Change password
        </Link>
      </div>
    </div>
  );
}
