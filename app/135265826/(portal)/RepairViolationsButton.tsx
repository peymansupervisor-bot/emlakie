'use client';

import { useState } from 'react';

type RepairStatus = 'idle' | 'running' | 'done' | 'error';

interface RepairResult {
  fixed: number;
  skipped: number;
  summary: string[];
}

export default function RepairViolationsButton({ hasViolations }: { hasViolations: boolean }) {
  const [status, setStatus] = useState<RepairStatus>('idle');
  const [result, setResult] = useState<RepairResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  async function repair() {
    setStatus('running');
    setResult(null);
    try {
      const res = await fetch('/api/admin/repair-ada-violations', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setStatus('done');
        setShowResult(true);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  }

  if (!hasViolations) return null;

  return (
    <div className="relative">
      <button
        onClick={repair}
        disabled={status === 'running'}
        className={`rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
          status === 'done'    ? 'bg-green-700 text-white' :
          status === 'error'   ? 'bg-red-700 text-white' :
          status === 'running' ? 'bg-amber-800 text-amber-200' :
                                 'bg-amber-600 text-white hover:bg-amber-500'
        }`}
      >
        {status === 'running' ? '🔧 Repairing…' :
         status === 'done'    ? `✅ ${result?.fixed ?? 0} fixed` :
         status === 'error'   ? '❌ Failed' :
                                '🔧 Repair Violations'}
      </button>

      {showResult && result && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">Repair Report</p>
            <button
              onClick={() => setShowResult(false)}
              className="text-gray-500 hover:text-gray-300 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="text-center">
              <p className="text-lg font-extrabold text-green-400">{result.fixed}</p>
              <p className="text-xs text-gray-500">fixed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-400">{result.skipped}</p>
              <p className="text-xs text-gray-500">skipped</p>
            </div>
          </div>
          {result.summary.length > 0 && (
            <ul className="space-y-1.5 mt-2">
              {result.summary.map((line, i) => (
                <li key={i} className="text-xs text-gray-400 leading-snug flex gap-1.5">
                  <span className="text-green-500 shrink-0">•</span>
                  {line}
                </li>
              ))}
            </ul>
          )}
          {result.fixed > 0 && (
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800">
              Changes committed. Run the audit again to verify.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
