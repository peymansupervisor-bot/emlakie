'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

type Landlord = { id: string; first_name: string | null; last_name: string | null; display_name: string | null; email: string | null; account_id: string | null };

function nameOf(l: Landlord) {
  return [l.first_name, l.last_name].filter(Boolean).join(' ') || l.display_name || l.email?.split('@')[0] || 'Unknown';
}

export default function LandlordActions({ landlordId, isBanned }: { landlordId: string; isBanned: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [listingAction, setListingAction] = useState<'inactive' | 'reassign'>('inactive');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Landlord[]>([]);
  const [selected, setSelected] = useState<Landlord | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (listingAction !== 'reassign') return;
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      const res = await fetch(`/api/admin/landlords/search?q=${encodeURIComponent(query)}&exclude=${landlordId}`);
      const json = await res.json();
      setResults(json.landlords ?? []);
    }, 300);
  }, [query, listingAction, landlordId]);

  async function confirmSuspend() {
    if (listingAction === 'reassign' && !selected) return;
    setBusy(true);
    setShowSuspendModal(false);
    await fetch(`/api/admin/landlords/${landlordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'suspend',
        listing_action: listingAction,
        reassign_to: listingAction === 'reassign' ? selected?.id : undefined,
      }),
    });
    setBusy(false);
    router.refresh();
  }

  async function unsuspend() {
    if (!confirm('Unsuspend this landlord? Their account will be restored and inactive listings reactivated.')) return;
    setBusy(true);
    await fetch(`/api/admin/landlords/${landlordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unsuspend' }),
    });
    setBusy(false);
    router.refresh();
  }

  async function deleteAccount() {
    if (!confirm('Permanently delete this landlord account and ALL their listings? This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure? This is irreversible.')) return;
    setBusy(true);
    await fetch(`/api/admin/landlords/${landlordId}`, { method: 'DELETE' });
    setBusy(false);
    router.push('/135265826/landlords');
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {isBanned ? (
          <button
            onClick={unsuspend}
            disabled={busy}
            className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Unsuspend Account'}
          </button>
        ) : (
          <button
            onClick={() => { setShowSuspendModal(true); setListingAction('inactive'); setSelected(null); setQuery(''); setResults([]); }}
            disabled={busy}
            className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Suspend Account'}
          </button>
        )}
        <button
          onClick={deleteAccount}
          disabled={busy}
          className="rounded-xl bg-red-800 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-700 transition disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Delete Account'}
        </button>
      </div>

      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Suspend Account</h2>
            <p className="text-sm text-gray-400 mb-5">The landlord's account will be locked. What should happen to their listings?</p>

            <div className="flex flex-col gap-3 mb-5">
              <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${listingAction === 'inactive' ? 'border-amber-500 bg-amber-950/30' : 'border-gray-700 hover:border-gray-500'}`}>
                <input type="radio" name="la" value="inactive" checked={listingAction === 'inactive'} onChange={() => setListingAction('inactive')} className="mt-0.5 accent-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-white">Make Inactive</p>
                  <p className="text-xs text-gray-400 mt-0.5">Listings are hidden from the public but preserved. They can be restored if the account is unsuspended.</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${listingAction === 'reassign' ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 hover:border-gray-500'}`}>
                <input type="radio" name="la" value="reassign" checked={listingAction === 'reassign'} onChange={() => setListingAction('reassign')} className="mt-0.5 accent-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Reassign to Another Landlord</p>
                  <p className="text-xs text-gray-400 mt-0.5">Transfer all listings to an active landlord account.</p>
                  {listingAction === 'reassign' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Search by name or email…"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelected(null); }}
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                      {selected ? (
                        <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-900/40 border border-blue-600 px-3 py-2">
                          <span className="text-sm text-white">{nameOf(selected)} <span className="text-xs text-gray-400">· {selected.email}</span></span>
                          <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-white ml-2">✕</button>
                        </div>
                      ) : results.length > 0 ? (
                        <ul className="mt-1 rounded-lg border border-gray-700 bg-gray-800 overflow-hidden divide-y divide-gray-700">
                          {results.map(l => (
                            <li key={l.id}>
                              <button
                                onClick={() => { setSelected(l); setResults([]); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-700 transition"
                              >
                                <span className="text-sm text-white">{nameOf(l)}</span>
                                {l.account_id && <span className="text-xs text-gray-400 ml-2">· {l.account_id}</span>}
                                {l.email && <span className="text-xs text-gray-500 ml-2">· {l.email}</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : query.length > 0 ? (
                        <p className="mt-2 text-xs text-gray-500">No landlords found.</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="rounded-xl border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmSuspend}
                disabled={listingAction === 'reassign' && !selected}
                className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition disabled:opacity-40"
              >
                Confirm Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
