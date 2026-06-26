'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/landlord/client';

interface ScreeningRequest {
  id: string;
  tenant_name: string;
  tenant_email: string;
  status: 'invited' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completed_at: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  invited:     'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  completed:   'bg-green-50 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  invited:     'Invited',
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
        <p className="text-sm text-gray-500 mt-1">
          Background checks are run through{' '}
          <a href="https://www.mysmartmove.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
            TransUnion SmartMove
          </a>
          . Emlakie tracks your requests — reports are delivered directly to you by TransUnion.
        </p>
      </div>

      {/* How it works banner */}
      <div className="mb-6 rounded-xl border border-green-100 bg-green-50 px-5 py-4 flex items-start gap-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">?</div>
        <div className="text-sm text-green-900 space-y-0.5">
          <p className="font-semibold">How to screen a tenant</p>
          <p>Go to <strong>Inquiries</strong>, open an application, and click <strong>Run Background Check</strong>. You'll be directed to SmartMove to invite the applicant. The report is sent directly to your SmartMove account.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg font-semibold">No screening requests yet</p>
          <p className="text-gray-400 text-sm mt-1">Go to <strong>Inquiries</strong> and click "Run Background Check" on an applicant to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-gray-900">{r.tenant_name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{r.tenant_email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Initiated {formatDate(r.created_at)}
                    {r.completed_at ? ` · Completed ${formatDate(r.completed_at)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {r.status === 'invited' && (
                    <button
                      onClick={() => updateStatus(r.id, 'completed')}
                      disabled={updating === r.id}
                      className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {updating === r.id ? 'Saving…' : 'Mark Completed'}
                    </button>
                  )}
                  <a
                    href="https://www.mysmartmove.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Open SmartMove →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
