'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RemoveModeratorButton({ moderatorId, email }: { moderatorId: string; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleRemove() {
    if (!confirm(`Remove ${email} as moderator?`)) return;
    setBusy(true);
    await fetch(`/api/admin/moderators/${moderatorId}`, { method: 'DELETE' });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={handleRemove} disabled={busy}
      className="rounded-lg bg-gray-800 px-2 py-1 text-xs font-semibold text-gray-400 hover:bg-red-900 hover:text-red-300 transition disabled:opacity-50">
      Remove
    </button>
  );
}
