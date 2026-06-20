'use client';

import { useState } from 'react';

export default function RunHealthCheckButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');

  async function run() {
    setState('running');
    try {
      const res = await fetch('/api/admin/run-health-check', { method: 'POST' });
      if (res.ok) {
        setState('done');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Health check error:', data);
        setState('error');
        setTimeout(() => setState('idle'), 4000);
      }
    } catch (e) {
      console.error('Health check fetch error:', e);
      setState('error');
      setTimeout(() => setState('idle'), 4000);
    }
  }

  return (
    <button
      onClick={run}
      disabled={state === 'running'}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
        state === 'done'    ? 'bg-green-700 text-white' :
        state === 'error'   ? 'bg-red-700 text-white' :
        state === 'running' ? 'bg-gray-700 text-gray-300' :
                              'bg-gray-700 text-white hover:bg-gray-600'
      }`}
    >
      {state === 'running' ? '⏳ Running…' :
       state === 'done'    ? '✅ Done — refresh to see results' :
       state === 'error'   ? '❌ Failed' :
                             '▶ Run Now'}
    </button>
  );
}
