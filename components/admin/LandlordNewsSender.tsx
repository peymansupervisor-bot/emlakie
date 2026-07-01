'use client'

import { useState } from 'react'

const DEFAULT_BODY = `<p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">Since your listing is in Los Angeles, wanted to flag a City update that affects your property. LAHD refreshed its official Renter Protections Notice on July 1, 2026, reflecting two real changes to the law: <strong>AB 628</strong> now requires a working stove and refrigerator in every unit, and the <strong>LARSO</strong> amendment (pre-1978, 2+ unit buildings) removed the old utility surcharge and "added dependent" rent increase.</p>
<a href="https://emlakie.com/blog/la-renter-protections-notice-2026-update" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">Read the full breakdown &rarr;</a>`;

interface DryRunResult {
  sent: number;
  skipped: number;
  recipients: { email: string; name: string | null }[] | string[];
}

interface SendResult {
  sent: number;
  skipped: number;
  recipients: string[];
}

export default function LandlordNewsSender() {
  const [city, setCity] = useState('Los Angeles');
  const [subject, setSubject] = useState("Heads Up: LA's Renter Protections Notice Was Just Updated");
  const [badge, setBadge] = useState('EMLAKIE UPDATE');
  const [title, setTitle] = useState("LA's Renter Protections Notice Was Just Updated");
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_BODY);

  const [preview, setPreview] = useState<DryRunResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function call(dryRun: boolean) {
    const res = await fetch('/api/admin/landlord-news/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, badge, title, bodyHtml, city: city.trim() || undefined, dryRun }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
    return data;
  }

  async function handlePreview() {
    setError('');
    setResult(null);
    setPreviewing(true);
    try {
      const data = await call(true);
      setPreview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSend() {
    setError('');
    setSending(true);
    setConfirmOpen(false);
    try {
      const data = await call(false);
      setResult(data);
      setPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">City filter (blank = all landlords)</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Badge</label>
          <input value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Email subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Heading (inside the email)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Body HTML</label>
          <textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} rows={8} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono" />
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {preview && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <p className="font-semibold mb-1">Preview — nothing sent yet</p>
          <p>{preview.recipients.length} recipient{preview.recipients.length !== 1 ? 's' : ''} would receive this ({preview.skipped} skipped — unsubscribed or missing email):</p>
          <ul className="mt-2 list-disc pl-5">
            {preview.recipients.map((r, i) => (
              <li key={i}>{typeof r === 'string' ? r : `${r.name ?? '—'} — ${r.email}`}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Sent to {result.sent} landlord{result.sent !== 1 ? 's' : ''} ({result.skipped} skipped).
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handlePreview}
          disabled={previewing}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {previewing ? 'Loading…' : 'Preview recipients'}
        </button>

        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={sending}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            Send
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Send to all matching landlords now?</span>
            <button onClick={handleSend} disabled={sending} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {sending ? 'Sending…' : 'Confirm send'}
            </button>
            <button onClick={() => setConfirmOpen(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
