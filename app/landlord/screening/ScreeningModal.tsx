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

const BUNDLES = [
  {
    id: 'premium',
    label: 'SmartCheck Premium',
    price: 48,
    badge: 'Recommended',
    desc: 'Credit, Criminal, Eviction, Income Insights & Identity Check — the most complete screening.',
  },
  {
    id: 'standard',
    label: 'SmartCheck Non-Criminal Standard',
    price: 38,
    badge: null,
    desc: 'Credit, Eviction, Income Insights & Identity Check (no criminal report).',
  },
];

export default function ScreeningModal({ applicationId, listingId, listingAddress, tenantName, tenantEmail: initialEmail, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bundle, setBundle] = useState<string>('premium');
  const [paidBy, setPaidBy] = useState<'applicant' | 'landlord'>('applicant');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedBundle = BUNDLES.find(b => b.id === bundle)!;

  async function submit() {
    if (!email) { setError('Please enter the applicant\'s email.'); return; }
    if (!bundle) { setError('Select at least one report.'); return; }
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch('/api/screening/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ application_id: applicationId, listing_id: listingId, tenant_name: tenantName, tenant_email: email, packages: [bundle], paid_by: paidBy }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Request failed');
      window.open('https://rentals-secure.mysmartmove.com/landlord/firstscreening/step-one', '_blank');
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-200">Screen a Tenant</p>
            <p className="text-white font-bold text-lg">{tenantName}</p>
            <p className="text-green-200 text-xs">{listingAddress}</p>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-gray-100">
          {['Screening Options', 'Who Pays?', 'Applicant Email'].map((label, i) => (
            <div key={i} className={`flex-1 py-3 text-center text-xs font-semibold ${step === i + 1 ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}>
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <div className="p-6">
          {/* Step 1: Bundle Selection */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Select the TransUnion SmartMove screening bundle for this applicant.</p>
              {BUNDLES.map(b => (
                <label key={b.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${bundle === b.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="bundle" checked={bundle === b.id} onChange={() => setBundle(b.id)} className="mt-1 accent-green-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{b.label}</span>
                      <div className="flex items-center gap-2">
                        {b.badge && <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5">{b.badge}</span>}
                        <span className="text-green-700 font-bold">${b.price}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                  </div>
                </label>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-500">Total: <strong className="text-gray-900">${selectedBundle.price}</strong></span>
                <button onClick={() => setStep(2)} className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Who Pays */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Who covers the screening fee?</p>
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${paidBy === 'applicant' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="paidby" value="applicant" checked={paidBy === 'applicant'} onChange={() => setPaidBy('applicant')} className="mt-0.5 accent-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Applicant pays (${selectedBundle.price})</p>
                  <p className="text-xs text-gray-500">Most common. The tenant pays TransUnion directly when completing their screening.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${paidBy === 'landlord' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="paidby" value="landlord" checked={paidBy === 'landlord'} onChange={() => setPaidBy('landlord')} className="mt-0.5 accent-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">I pay (${selectedBundle.price})</p>
                  <p className="text-xs text-gray-500">You cover the fee — good for competitive markets where you want to attract applicants.</p>
                </div>
              </label>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← Back</button>
                <button onClick={() => setStep(3)} className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">Next →</button>
              </div>
            </div>
          )}

          {/* Step 3: Applicant Email */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Enter <strong>{tenantName}</strong>'s email so Emlakie can notify them. You'll then initiate the screening on SmartMove and TransUnion will email them the screening link.</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Applicant Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tenant@email.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-xs text-green-800 space-y-1">
                <p className="font-semibold">What happens next:</p>
                <p>1. Emlakie records this screening request and notifies the applicant</p>
                <p>2. You go to SmartMove and enter the tenant's info to initiate</p>
                <p>3. TransUnion emails the tenant a secure link to complete screening</p>
                <p>4. The report is delivered to you by TransUnion</p>
                <p>5. Mark as complete in your Screening dashboard</p>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← Back</button>
                <button onClick={submit} disabled={loading} className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50">
                  {loading ? 'Saving…' : 'Save & Go to SmartMove'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
