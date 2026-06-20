'use client';

import { useState, useTransition } from 'react';
import BuildingGroup from './BuildingGroup';
import { assignPropertyGroup } from './actions';

interface Listing {
  id: string;
  title: string;
  address: string | null;
  city: string;
  state: string;
  status: string;
  monthly_rent: number | null;
  created_at: string;
  slug: string | null;
  listing_source: string | null;
  flags: number;
  property_group: string | null;
}

interface CityGroup {
  city: string;
  buildings: { address: string; listings: Listing[] }[];
}

export default function ListingsClient({ cityGroups }: { cityGroups: CityGroup[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState('');

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Flatten all listings for address derivation
  const allListings = cityGroups.flatMap((c) => c.buildings.flatMap((b) => b.listings));

  function openModal() {
    const sel = allListings.filter((l) => selected.has(l.id));
    const addrs = sel.map((l) => l.address ?? '');
    const streets = addrs.map((a) => a.replace(/^\d+\s*/, '').trim());
    const commonStreet = streets.length > 0 && streets.every((s) => s === streets[0]) ? streets[0] : '';
    if (commonStreet) {
      const nums = addrs.map((a) => parseInt(a)).filter(Boolean).sort((a, b) => a - b);
      setGroupName(nums.length > 1 ? `${nums[0]}-${nums[nums.length - 1]} ${commonStreet}` : addrs[0]);
    } else {
      setGroupName('');
    }
    setShowModal(true);
  }

  function save() {
    if (!groupName.trim()) return;
    startTransition(async () => {
      await assignPropertyGroup(Array.from(selected), groupName.trim());
      setShowModal(false);
      setSelected(new Set());
      showToast('✅ Compound assigned — reloading…');
      setTimeout(() => window.location.reload(), 1200);
    });
  }

  function removeGrouping() {
    startTransition(async () => {
      await assignPropertyGroup(Array.from(selected), null);
      setSelected(new Set());
      showToast('✅ Grouping removed — reloading…');
      setTimeout(() => window.location.reload(), 1200);
    });
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <>
      <div className="space-y-6">
        {cityGroups.map(({ city, buildings }) => (
          <div key={city}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-base">📍</span>
              <h2 className="text-base font-extrabold text-white">{city}</h2>
              <span className="text-xs text-gray-500">
                {buildings.length} building{buildings.length !== 1 ? 's' : ''} · {buildings.flatMap((b) => b.listings).length} unit{buildings.flatMap((b) => b.listings).length !== 1 ? 's' : ''}
              </span>
              <div className="flex-1 border-t border-gray-800" />
            </div>
            <div className="space-y-2">
              {buildings.map(({ address, listings }) => (
                <BuildingGroup
                  key={address}
                  address={address}
                  listings={listings}
                  selectedIds={selected}
                  onToggle={toggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating selection toolbar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl px-5 py-3">
          <span className="text-sm font-bold text-white">{selected.size} unit{selected.size !== 1 ? 's' : ''} selected</span>
          <button
            onClick={openModal}
            className="rounded-xl bg-green-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-500 transition"
          >
            Assign to compound
          </button>
          <button
            onClick={removeGrouping}
            disabled={isPending}
            className="rounded-xl bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600 transition disabled:opacity-50"
          >
            Remove grouping
          </button>
          <button onClick={() => setSelected(new Set())} className="text-gray-500 hover:text-gray-300 text-sm ml-1">✕</button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-green-700 px-6 py-3 text-sm font-bold text-white shadow-2xl pointer-events-none">
          {toast}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl p-6">
            <h2 className="text-base font-extrabold text-white mb-1">Assign compound address</h2>
            <p className="text-xs text-gray-400 mb-4">
              All {selected.size} selected units will be grouped under this label.
            </p>
            <input
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              placeholder="e.g. 3133-3137 Hollycrest Dr"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-sm text-gray-400 hover:text-white transition">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={isPending || !groupName.trim()}
                className="rounded-xl bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-500 transition disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
