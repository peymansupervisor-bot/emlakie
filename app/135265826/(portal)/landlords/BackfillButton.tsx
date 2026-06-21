'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BackfillButton({ missingCount }: { missingCount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (missingCount === 0) return null;

  async function run() {
    if (!confirm(`Assign account IDs to ${missingCount} landlord${missingCount !== 1 ? 's' : ''} missing one?`)) return;
    setBusy(true);
    setResult(null);
    const res = await fetch('/api/admin/landlords/backfill-ids', { method: 'POST' });
    const json = await res.json();
    setBusy(false);
    setResult(`Assigned ${json.assigned} of ${json.total} IDs.${json.errors ? ` ${json.errors.length} error(s).` : ''}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={busy}
        className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition disabled:opacity-50"
      >
        {busy ? 'Assigning…' : `Fix ${missingCount} missing ID${missingCount !== 1 ? 's' : ''}`}
      </button>
      {result && <span className="text-xs text-gray-400">{result}</span>}
    </div>
  );
}
