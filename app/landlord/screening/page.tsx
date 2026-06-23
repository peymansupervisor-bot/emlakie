'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/landlord/client';

interface ScreeningRequest {
  id: string;
  application_id: string | null;
  listing_id: string;
  tenant_name: string;
  tenant_email: string;
  packages: string[];
  paid_by: string;
  status: 'invited' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

const PACKAGE_LABELS: Record<string, string> = {
  credit: 'Credit',
  background: 'Background',
  eviction: 'Eviction',
};

const STATUS_STYLES: Record<string, string> = {
  invited:     'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  invited:     'Invite Sent',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

export default function ScreeningPage() {
  const [requests, setRequests] = useState<ScreeningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    const token = await getToken();
    const res = await fetch('/api/screening/list', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRequests(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const token = await getToken();
    await fetch(`/api/screening/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    await load();
    setUpdating(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Tenant Screening</h1>
        <p className="text-sm text-gray-500 mt-1">Track all screening requests you've sent to applicants.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg font-semibold">No screening requests yet</p>
          <p className="text-gray-400 text-sm mt-1">Go to <strong>Inquiries</strong> and click "Screen Tenant" on an applicant to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-lg">{r.tenant_name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{r.tenant_email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.packages.map(p => (
                      <span key={p} className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        {PACKAGE_LABELS[p] ?? p}
                      </span>
                    ))}
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                      Paid by {r.paid_by}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Sent {formatDate(r.created_at)}{r.completed_at ? ` · Completed ${formatDate(r.completed_at)}` : ''}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[160px]">
                  {r.status === 'invited' && (
                    <>
                      <button
                        onClick={() => updateStatus(r.id, 'in_progress')}
                        disabled={updating === r.id}
                        className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, 'cancelled')}
                        disabled={updating === r.id}
                        className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {r.status === 'in_progress' && (
                    <button
                      onClick={() => updateStatus(r.id, 'completed')}
                      disabled={updating === r.id}
                      className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {updating === r.id ? 'Saving…' : 'Mark Completed ✓'}
                    </button>
                  )}
                  {r.status === 'completed' && (
                    <a
                      href="https://www.mysmartmove.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 transition text-center"
                    >
                      View Report →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
