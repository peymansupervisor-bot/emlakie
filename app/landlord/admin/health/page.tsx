'use client';

import { useEffect, useState, useCallback } from 'react';
import { getToken, getCurrentUserId } from '@/lib/landlord/client';

const ADMIN_USER_ID = 'da34cd86-ffa8-49f9-96d5-0daa3dec8953';

interface HealthRow { status: string; message: string; checked_at: string }
interface ErrorRow { source: string; message: string; endpoint: string | null; created_at: string }
interface StatusData {
  critical: {
    signup: HealthRow | null;
    listings: HealthRow | null;
    ai: HealthRow | null;
  };
  recent_errors: ErrorRow[];
  env: {
    supabase: boolean;
    openai_key: boolean;
    ai_enabled: boolean;
    resend: boolean;
  };
  checked_at: string;
}

function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">No data</span>;
  const ok = status === 'ok';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {ok ? 'OK' : 'DOWN'}
    </span>
  );
}

function EnvDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />;
}

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export default function AdminHealthPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    const [token, userId] = await Promise.all([getToken(), getCurrentUserId()]);
    if (userId !== ADMIN_USER_ID) { setIsAdmin(false); return; }
    setIsAdmin(true);
    const res = await fetch('/api/admin/critical-status', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) { setError(`Failed to load status (${res.status})`); return; }
    setData(await res.json());
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  if (isAdmin === false) {
    return <div className="py-16 text-center text-gray-500">Access restricted.</div>;
  }
  if (!data && !error) {
    return <div className="py-16 text-center text-gray-500">Loading…</div>;
  }
  if (error) {
    return <div className="py-16 text-center text-red-600">{error}</div>;
  }
  if (!data) return null;

  const flows = [
    { label: 'Landlord Signup', key: 'signup' as const, desc: 'OAuth + email signup pipeline' },
    { label: 'Listing Creation', key: 'listings' as const, desc: 'API route + photo storage + DB insert' },
    { label: 'AI Leasing Assistant', key: 'ai' as const, desc: 'OpenAI token endpoint + WebRTC' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-green-600">Admin</p>
        <h1 className="mt-1 text-2xl font-extrabold text-gray-900">Critical Flow Health</h1>
        <p className="mt-1 text-sm text-gray-500">
          Checked every 30 min · Last refreshed {timeAgo(data.checked_at)} · Auto-refreshes every 60s
        </p>
      </div>

      {/* 3 critical flows */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {flows.map(({ label, key, desc }) => {
          const row = data.critical[key];
          return (
            <div
              key={key}
              className={`rounded-2xl border p-5 ${!row || row.status === 'ok' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <StatusBadge status={row?.status} />
              </div>
              <p className="mt-1 text-xs text-gray-500">{desc}</p>
              {row && (
                <>
                  <p className="mt-3 text-xs text-gray-700">{row.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{timeAgo(row.checked_at)}</p>
                </>
              )}
              {!row && <p className="mt-3 text-xs text-amber-600">No check run yet — first check happens at the next 30-min mark.</p>}
            </div>
          );
        })}
      </div>

      {/* Environment variables */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-bold text-gray-900">Environment Variables</h2>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-4">
          {[
            { label: 'Supabase', ok: data.env.supabase },
            { label: 'OpenAI Key', ok: data.env.openai_key },
            { label: 'AI Enabled', ok: data.env.ai_enabled },
            { label: 'Resend Email', ok: data.env.resend },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2">
              <EnvDot ok={ok} />
              <span className={ok ? 'text-gray-700' : 'font-semibold text-red-600'}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent critical errors */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-bold text-gray-900">Critical Errors — Last 24 Hours</h2>
        {data.recent_errors.length === 0 ? (
          <p className="mt-3 text-sm text-green-600">No critical errors in the last 24 hours.</p>
        ) : (
          <div className="mt-3 divide-y divide-gray-100">
            {data.recent_errors.map((e, i) => (
              <div key={i} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">{e.source}</span>
                  <span className="shrink-0 text-xs text-gray-400">{timeAgo(e.created_at)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-700">{e.message}</p>
                {e.endpoint && <p className="mt-0.5 text-xs text-gray-400">{e.endpoint}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
