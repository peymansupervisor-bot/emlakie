'use client';

import { useState } from 'react';

export default function BackfillVaultsButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState('');

  async function run() {
    setState('running');
    try {
      const res = await fetch('/api/admin/backfill-vaults', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setState('error'); setResult(data.error ?? 'Failed'); return; }
      setState('done');
      setResult(`${data.initialised}/${data.total} vaults initialised`);
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      setState('error');
      setResult('Network error');
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={state === 'running' || state === 'done'}
        className="rounded-lg bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 px-3 py-1 text-xs font-bold text-white transition"
      >
        {state === 'running' ? 'Fixing…' : state === 'done' ? '✓ Done' : 'Fix vaults'}
      </button>
      {result && <span className="text-xs text-gray-400">{result}</span>}
    </div>
  );
}
