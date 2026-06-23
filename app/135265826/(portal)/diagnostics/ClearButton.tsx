'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearButton({ source, count }: { source?: string; count: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClear() {
    const label = source ? `"${source}" errors` : `all ${count} errors`;
    if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
    setLoading(true);
    await fetch('/api/admin/clear-diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source ? { source } : {}),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClear}
      disabled={loading || count === 0}
      className="rounded-xl border border-red-700 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-900/30 transition disabled:opacity-40"
    >
      {loading ? 'Clearing…' : source ? `Clear "${source}"` : `Clear All (${count})`}
    </button>
  );
}
