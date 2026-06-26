'use client';

import { useState } from 'react';
import { getToken } from '@/lib/landlord/client';

interface Props {
  applicationId: string;
  listingId: string;
  listingAddress: string;
  tenantName: string;
  tenantEmail?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScreeningModal({ applicationId, listingId, listingAddress, tenantName, tenantEmail: initialEmail, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function proceed() {
    if (!email) { setError('Please enter the applicant\'s email.'); return; }
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      await fetch('/api/screening/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          application_id: applicationId,
          listing_id: listingId,
          tenant_name: tenantName,
          tenant_email: email,
          packages: ['smartmove'],
          paid_by: 'applicant',
        }),
      });
      window.open('https://www.mysmartmove.com', '_blank');
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-green-600 px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-200 mb-1">Run Background Check</p>
            <p className="text-white font-bold text-lg leading-tight">{tenantName}</p>
            <p className="text-green-200 text-xs mt-0.5">{listingAddress}</p>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white text-2xl leading-none ml-4">×</button>
        </div>

        <div className="p-6 space-y-5">

          {/* How it works */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">How it works</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">1</span>
                <p>Click <strong>Go to SmartMove</strong> and sign in (or create a free landlord account).</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">2</span>
                <p>Invite <strong>{tenantName}</strong> using their email below — SmartMove sends them a secure link.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">3</span>
                <p>The applicant completes and pays on TransUnion's secure site. You receive the report directly.</p>
              </div>
            </div>
          </div>

          {/* Tenant email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Applicant email <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tenant@email.com"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500"
              />
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(email); }}
                title="Copy email"
                className="rounded-xl border border-gray-200 px-3 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter this email when inviting the applicant on SmartMove.</p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* CTA */}
          <button
            onClick={proceed}
            disabled={loading}
            className="w-full rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Opening SmartMove…' : 'Go to SmartMove →'}
          </button>

          <p className="text-center text-xs text-gray-400">
            SmartMove is powered by TransUnion. Emlakie does not collect or store applicant screening data.
          </p>
        </div>
      </div>
    </div>
  );
}
