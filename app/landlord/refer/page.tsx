'use client';

import { useEffect, useState } from 'react';
import { getMyListings, getToken } from '@/lib/landlord/client';
import { LandlordListing } from '@/lib/landlord/types';

interface Summary {
  code: string | null;
  link: string | null;
  invited: number;
  qualified: number;
  credits: { id: string; days: number }[];
}

const SHARE_MESSAGE =
  "I list my rentals free on EMLAKIE — no broker fees, and tenants call you directly. Sign up with my link and we both get a free 30-day listing boost:";

export default function ReferPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [listings, setListings] = useState<LandlordListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedListing, setSelectedListing] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [notice, setNotice] = useState('');

  async function load() {
    const token = await getToken();
    const [res, myListings] = await Promise.all([
      fetch('/api/referrals', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => null),
      getMyListings().catch(() => []),
    ]);
    if (res && !res.error) setSummary(res);
    setListings(myListings);
    if (myListings[0]) setSelectedListing(myListings[0].id);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function copyLink() {
    if (!summary?.link) return;
    try {
      await navigator.clipboard.writeText(summary.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  async function redeem(creditId: string) {
    if (!selectedListing) { setNotice('Add or select a listing to boost first.'); return; }
    setRedeeming(true);
    setNotice('');
    const token = await getToken();
    const res = await fetch('/api/referrals/redeem', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ creditId, listingId: selectedListing }),
    }).then((r) => r.json()).catch(() => ({ error: 'Network error' }));
    setRedeeming(false);
    if (res.error) { setNotice(res.error); return; }
    setNotice('🎉 Boost applied! Your listing now has premium placement for 30 days.');
    load();
  }

  if (loading) return <div className="py-20 text-center text-gray-500">Loading…</div>;

  const link = summary?.link ?? '';
  const shareText = encodeURIComponent(`${SHARE_MESSAGE} ${link}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Refer a landlord, you both get a free Boost</h1>
      <p className="mt-2 text-gray-600">
        Invite another landlord with your personal link. When they publish their first listing, you <strong>both</strong> get a
        free <strong>30-day listing Boost</strong> (a $49 value) — premium placement at the top of search results.
      </p>

      {/* Referral link */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="text-sm font-semibold text-gray-700">Your referral link</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={link}
            aria-label="Your referral link"
            className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none"
          />
          <button
            onClick={copyLink}
            className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a href={`sms:?&body=${shareText}`} className="font-semibold text-brand-700 hover:text-brand-800">Share via text</a>
          <a href={`mailto:?subject=${encodeURIComponent('List your rental free on EMLAKIE')}&body=${shareText}`} className="font-semibold text-brand-700 hover:text-brand-800">Share via email</a>
          <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:text-brand-800">Share on WhatsApp</a>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{summary?.invited ?? 0}</p>
          <p className="mt-1 text-sm text-gray-500">Landlords invited</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-3xl font-extrabold text-brand-700">{summary?.qualified ?? 0}</p>
          <p className="mt-1 text-sm text-gray-500">Rewards earned</p>
        </div>
      </div>

      {/* Available credits */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">Your free Boost credits</h2>
        {summary && summary.credits.length > 0 ? (
          <>
            <p className="mt-1 text-sm text-gray-600">
              You have <strong>{summary.credits.length}</strong> free {summary.credits[0].days}-day Boost
              {summary.credits.length > 1 ? 's' : ''} ready to use. Choose a listing to boost:
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                aria-label="Choose a listing to boost"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand-600"
              >
                {listings.length === 0 && <option value="">No listings yet</option>}
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>{l.title || l.address}</option>
                ))}
              </select>
              <button
                onClick={() => redeem(summary.credits[0].id)}
                disabled={redeeming || listings.length === 0}
                className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60"
              >
                {redeeming ? 'Applying…' : 'Redeem Boost'}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            No Boost credits yet. Share your link above — when a landlord you invite publishes their first listing, a free
            30-day Boost lands here.
          </p>
        )}
        {notice && <p className="mt-3 text-sm font-medium text-gray-700">{notice}</p>}
      </div>

      {/* How it works */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-sm font-bold text-gray-900">How it works</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-600">
          <li>Share your link with another landlord.</li>
          <li>They sign up and publish their first listing.</li>
          <li>You both instantly get a free 30-day Boost — theirs is applied automatically, yours appears here to use on any listing.</li>
        </ol>
      </div>
    </div>
  );
}
