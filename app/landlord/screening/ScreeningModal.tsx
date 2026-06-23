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

const PACKAGES = [
  { id: 'credit',     label: 'Credit Report',    price: 14, desc: 'Credit score, payment history, debt load' },
  { id: 'background', label: 'Background Check',  price: 14, desc: 'Criminal records, sex offender registry' },
  { id: 'eviction',   label: 'Eviction History',  price: 7,  desc: 'Past evictions and judgments' },
];

export default function ScreeningModal({ applicationId, listingId, listingAddress, tenantName, tenantEmail: initialEmail, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<string[]>(['credit', 'background', 'eviction']);
  const [paidBy, setPaidBy] = useState<'applicant' | 'landlord'>('applicant');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = selected.reduce((s, id) => s + (PACKAGES.find(p => p.id === id)?.price ?? 0), 0);

  function togglePackage(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }

  async function submit() {
    if (!email) { setError('Please enter the applicant\'s email.'); return; }
    if (!selected.length) { setError('Select at least one report.'); return; }
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch('/api/screening/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ application_id: applicationId, listing_id: listingId, tenant_name: tenantName, tenant_email: email, packages: selected, paid_by: paidBy }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Request failed');
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
          {/* Step 1: Package Selection */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Select the reports you want to run on this applicant.</p>
              {PACKAGES.map(pkg => (
                <label key={pkg.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${selected.includes(pkg.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={selected.includes(pkg.id)} onChange={() => togglePackage(pkg.id)} className="mt-0.5 accent-green-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{pkg.label}</span>
                      <span className="text-green-700 font-bold">${pkg.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{pkg.desc}</p>
                  </div>
                </label>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-500">Total: <strong className="text-gray-900">${total}</strong></span>
                <button onClick={() => selected.length ? setStep(2) : setError('Select at least one report.')} className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
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
                  <p className="font-semibold text-gray-900">Applicant pays (${total})</p>
                  <p className="text-xs text-gray-500">Most common. The tenant pays TransUnion directly when completing their screening.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${paidBy === 'landlord' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="paidby" value="landlord" checked={paidBy === 'landlord'} onChange={() => setPaidBy('landlord')} className="mt-0.5 accent-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">I pay (${total})</p>
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
              <p className="text-sm text-gray-600">We'll email <strong>{tenantName}</strong> a secure link to complete their screening on TransUnion SmartMove.</p>
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
                <p>1. Tenant receives an email with a SmartMove link</p>
                <p>2. They complete the screening on TransUnion's secure site</p>
                <p>3. The report is emailed to you directly by TransUnion</p>
                <p>4. Mark as complete in your Screening dashboard</p>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← Back</button>
                <button onClick={submit} disabled={loading} className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50">
                  {loading ? 'Sending…' : 'Send Screening Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
