'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile } from '@/lib/landlord/client';

const inputCls = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-0';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [email, setEmail] = useState('');
  const [accountId, setAccountId] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile().then((p) => {
      if (!p) return;
      setForm({
        first_name: p.first_name ?? '',
        last_name: p.last_name ?? '',
        phone: p.phone ?? '',
      });
      setEmail(p.email ?? '');
      setAccountId(p.account_id ?? '');
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) { setError('First name is required.'); return; }
    if (!form.last_name.trim()) { setError('Last name is required.'); return; }
    if (!form.phone.trim()) { setError('Phone number is required.'); return; }
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid phone number.'); return; }
    setError('');
    setBusy(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => router.push('/landlord'), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-extrabold text-gray-900">Edit profile</h1>
      <p className="mt-1 text-sm text-gray-500">Your name and phone number are shown to interested tenants.</p>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      {saved && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">Saved! Redirecting…</p>}

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
          <input className={inputCls} type="tel" value={form.phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
              let formatted = digits;
              if (digits.length > 6) formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
              else if (digits.length > 3) formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
              else if (digits.length > 0) formatted = `(${digits}`;
              setForm((f) => ({ ...f, phone: formatted }));
            }}
            placeholder="(818) 300-3005" />
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

        <button type="submit" disabled={busy || saved}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
