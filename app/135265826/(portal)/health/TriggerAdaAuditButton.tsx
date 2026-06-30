'use client';

import { useState } from 'react';

export default function TriggerAdaAuditButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [detail, setDetail] = useState('');

  async function run() {
    setState('running');
    setDetail('');
    try {
      const res = await fetch('/api/admin/run-ada-audit', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDetail(data.total_violations != null ? `${data.total_violations} violations found` : 'Complete');
        setState('done');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setDetail(data.error ?? 'Unknown error');
        setState('error');
        setTimeout(() => setState('idle'), 5000);
      }
    } catch (e) {
      setDetail(String(e));
      setState('error');
      setTimeout(() => setState('idle'), 5000);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={state === 'running'}
        className={`rounded-lg px-3 py-1 text-xs font-bold transition disabled:opacity-60 ${
          state === 'done'    ? 'bg-green-700 text-white' :
          state === 'error'   ? 'bg-red-700 text-white' :
          state === 'running' ? 'bg-gray-700 text-gray-300' :
                                'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      >
        {state === 'running' ? '⏳ Running (~5 min)…' :
         state === 'done'    ? '✅ Done' :
         state === 'error'   ? '❌ Failed' :
                               '▶ Run Audit'}
      </button>
      {detail && (
        <p className={`text-xs ${state === 'error' ? 'text-red-400' : 'text-gray-400'}`}>{detail}</p>
      )}
    </div>
  );
}
