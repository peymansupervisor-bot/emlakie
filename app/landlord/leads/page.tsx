'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllApplications, updateApplicationStatus } from '@/lib/landlord/client';
import { Application, LandlordListing } from '@/lib/landlord/types';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

interface Lead extends Application {
  listingAddress?: string;
  listingId?: string;
}

function MatchScore({ score }: { score?: number }) {
  if (score == null) return null;
  const cls = score >= 80 ? 'bg-brand-50 text-brand-700' : score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>{score}% match</span>;
}

function StatusPill({ status }: { status: string }) {
  const cls = status === 'pending' ? 'bg-amber-100 text-amber-800' : status === 'approved' ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-600';
  const label = status === 'pending' ? 'New' : status === 'approved' ? 'Responded' : 'Ignored';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${cls}`}>{label}</span>;
}

function ApplicantDrawer({ lead, onClose, onStatusChange }: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusable.length === 0) { e.preventDefault(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const initials = (lead.tenant_name ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Applicant details — ${lead.tenant_name ?? 'Applicant'}`}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Applicant details</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {initials}
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{lead.tenant_name ?? 'Applicant'}</p>
              <p className="text-sm text-gray-500">{lead.listingAddress}</p>
              <p className="mt-0.5 text-xs text-gray-400">Applied {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Status + match */}
          <div className="flex items-center gap-3">
            <StatusPill status={lead.status} />
            <MatchScore score={lead.ai_match_score} />
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Income</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">${lead.income.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">/month</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Credit</p>
              <p className={`mt-1 text-lg font-extrabold ${lead.credit_score ? (lead.credit_score >= 700 ? 'text-brand-700' : lead.credit_score >= 620 ? 'text-amber-600' : 'text-red-600') : 'text-gray-400'}`}>
                {lead.credit_score ?? '—'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Move-in</p>
              <p className="mt-1 text-sm font-extrabold text-gray-900">
                {lead.move_in ? new Date(lead.move_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</p>
            {lead.tenant_phone ? (
              <a href={`tel:${lead.tenant_phone}`} className="flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {lead.tenant_phone}
              </a>
            ) : (
              <p className="text-sm text-gray-400">No phone provided</p>
            )}
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Message</p>
            <p className="text-sm leading-relaxed text-gray-700">{lead.message}</p>
          </div>

          {/* AI summary */}
          {lead.ai_summary && (
            <div className="rounded-xl bg-brand-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-1">AI summary</p>
              <p className="text-sm text-brand-900">{lead.ai_summary}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {lead.status === 'pending' && (
          <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
            <button
              onClick={() => onStatusChange(lead.id, 'approved')}
              className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Respond
            </button>
            <button
              onClick={() => onStatusChange(lead.id, 'rejected')}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Ignore
            </button>
          </div>
        )}
        {lead.status !== 'pending' && (
          <div className="border-t border-gray-100 px-6 py-4">
            <button
              onClick={() => onStatusChange(lead.id, 'pending' as 'approved')}
              className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Reset to pending
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const filterListing = searchParams.get('listing');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    getAllApplications()
      .then((apps) => setLeads(apps.map((a) => ({ ...a, listingId: a.listing_id }))))
      .catch(() => setLeads([]));
  }, []);

  async function handleStatusChange(applicationId: string, status: 'approved' | 'rejected' | 'pending') {
    const lead = leads?.find((l) => l.id === applicationId);
    if (!lead?.listingId) return;
    await updateApplicationStatus(lead.listingId, applicationId, status as 'approved' | 'rejected');
    setLeads((prev) => prev?.map((l) => l.id === applicationId ? { ...l, status: status as Application['status'] } : l) ?? null);
    setSelected((prev) => prev?.id === applicationId ? { ...prev, status: status as Application['status'] } : prev);
  }

  if (!leads) return <p className="py-16 text-center text-gray-500">Loading leads…</p>;

  const filtered = leads.filter((l) => {
    if (filterListing && l.listing_id !== filterListing) return false;
    if (filter !== 'all' && l.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.tenant_name?.toLowerCase().includes(q) || l.listingAddress?.toLowerCase().includes(q);
    }
    return true;
  });

  const pending = leads.filter((l) => l.status === 'pending').length;
  const approved = leads.filter((l) => l.status === 'approved').length;
  const rejected = leads.filter((l) => l.status === 'rejected').length;

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: `All (${leads.length})` },
    { id: 'pending', label: `New (${pending})` },
    { id: 'approved', label: `Responded (${approved})` },
    { id: 'rejected', label: `Ignored (${rejected})` },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">All applicants across your properties</p>
        </div>
        {pending > 0 && (
          <span className="rounded-full bg-brand-600 px-3 py-1 text-sm font-bold text-white">
            {pending} new
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter leads" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                filter === f.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <label htmlFor="leads-search" className="sr-only">Search leads</label>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-gray-400" fill="none" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input id="leads-search" type="text" placeholder="Search by name or address"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-semibold text-gray-900">No leads yet</p>
          <p className="mt-2 text-sm text-gray-500">When renters apply to your listings they'll appear here.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">Applicant</th>
                <th scope="col" className="hidden px-4 py-3 sm:table-cell">Property</th>
                <th scope="col" className="hidden px-4 py-3 md:table-cell">Income</th>
                <th scope="col" className="hidden px-4 py-3 md:table-cell">Credit</th>
                <th scope="col" className="px-4 py-3">Match</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => {
                const initials = (lead.tenant_name ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="cursor-pointer bg-white transition hover:bg-brand-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{lead.tenant_name ?? 'Applicant'}</p>
                          <p className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">{lead.listingAddress ?? '—'}</td>
                    <td className="hidden px-4 py-3 text-gray-700 md:table-cell">${lead.income.toLocaleString()}/mo</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className={`font-semibold ${lead.credit_score ? (lead.credit_score >= 700 ? 'text-brand-700' : lead.credit_score >= 620 ? 'text-amber-600' : 'text-red-600') : 'text-gray-400'}`}>
                        {lead.credit_score ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><MatchScore score={lead.ai_match_score} /></td>
                    <td className="px-4 py-3"><StatusPill status={lead.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ApplicantDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
