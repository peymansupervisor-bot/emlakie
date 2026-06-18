'use client';

import { useState } from 'react';

/* ─── Data ─────────────────────────────────────────────────────────────── */

type Role = 'renter' | 'landlord' | 'other';

interface Topic {
  id: string;
  label: string;
  icon: string;
  answer?: string; // instant answer — no form needed
  formSubject?: string; // pre-fills subject in the email form
  cta?: { label: string; href: string }; // direct action button
}

const ROLES: { id: Role; label: string; icon: string; desc: string }[] = [
  { id: 'renter',   label: 'I\'m a Renter',   icon: '🔑', desc: 'Looking for a home or have questions about a listing' },
  { id: 'landlord', label: 'I\'m a Landlord',  icon: '🏠', desc: 'Managing listings or need help with my account' },
  { id: 'other',    label: 'Something else',   icon: '💬', desc: 'Press, partnerships, or general feedback' },
];

const TOPICS: Record<Role, Topic[]> = {
  renter: [
    {
      id: 'apply',
      label: 'How do I apply for a rental?',
      icon: '📋',
      answer: 'Open any listing on emlakie.com and click "Apply for this home." Fill in your info and hit Send — your application goes directly to the landlord, no account needed.',
      cta: { label: 'Browse listings', href: '/rentals' },
    },
    {
      id: 'report',
      label: 'Report a suspicious listing',
      icon: '🚩',
      formSubject: 'Report a suspicious listing',
      answer: 'Please send us the listing URL and a brief description of the issue. We review all reports within 24 hours and remove fraudulent listings immediately.',
    },
    {
      id: 'landlord-response',
      label: 'Landlord hasn\'t responded',
      icon: '⏳',
      answer: 'Landlords respond at their own pace — we recommend waiting 2–3 business days. If you believe the listing is inactive, use the "Report" option on the listing page.',
    },
    {
      id: 'app',
      label: 'Help with the mobile app',
      icon: '📱',
      formSubject: 'Mobile app issue',
    },
    {
      id: 'other-renter',
      label: 'Something else',
      icon: '✉️',
      formSubject: 'Renter inquiry',
    },
  ],
  landlord: [
    {
      id: 'list',
      label: 'How do I list my property?',
      icon: '➕',
      answer: 'Download the EMLAKIE app, create a landlord account, and tap "Add Listing." Your property goes live instantly and is visible on emlakie.com.',
      cta: { label: 'Get the app', href: '/app' },
    },
    {
      id: 'edit-listing',
      label: 'Edit or remove a listing',
      icon: '✏️',
      answer: 'Open the EMLAKIE app, go to My Listings, tap the listing, and choose Edit or Mark as Rented. Changes appear on the website within a few minutes.',
    },
    {
      id: 'applications',
      label: 'Questions about applications',
      icon: '📩',
      answer: 'When a tenant applies, you\'ll receive an email notification with their info, income, credit score, and an AI match score. You can contact them directly by replying to that email.',
    },
    {
      id: 'account',
      label: 'Account or billing issue',
      icon: '⚙️',
      formSubject: 'Landlord account issue',
    },
    {
      id: 'other-landlord',
      label: 'Something else',
      icon: '✉️',
      formSubject: 'Landlord inquiry',
    },
  ],
  other: [
    {
      id: 'press',
      label: 'Press & media',
      icon: '📰',
      formSubject: 'Press inquiry',
      answer: 'For press inquiries, send us a message and we\'ll connect you with the right person.',
    },
    {
      id: 'partnership',
      label: 'Partnership or integration',
      icon: '🤝',
      formSubject: 'Partnership inquiry',
    },
    {
      id: 'feedback',
      label: 'Product feedback',
      icon: '💡',
      formSubject: 'Product feedback',
    },
    {
      id: 'other-other',
      label: 'General question',
      icon: '✉️',
      formSubject: 'General inquiry',
    },
  ],
};

/* ─── Sub-components ────────────────────────────────────────────────────── */

function EmailForm({ subject: initialSubject }: { subject?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialSubject ?? '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !email || !message) { setError('Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('Could not send. Please try again or email support@emlakie.com directly.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-10 text-center" role="status">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-brand-600" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 13 4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900">Message sent!</h3>
        <p className="mt-1 text-sm text-gray-500">We&apos;ll reply to <strong>{email}</strong> within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
          <input id="contact-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
            required aria-required="true"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
          <input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com"
            required aria-required="true"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
        <input id="contact-subject" type="text" value={subject} onChange={e => setSubject(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold text-gray-600 mb-1">Message *</label>
        <textarea id="contact-message" value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="How can we help?"
          required aria-required="true"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
      </div>
      {error && <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
        {loading ? 'Sending…' : 'Send Message'}
      </button>
      <p className="text-center text-xs text-gray-500">Or email us directly at <a href="mailto:support@emlakie.com" className="text-brand-600 hover:underline">support@emlakie.com</a></p>
    </form>
  );
}

/* ─── Main flow ─────────────────────────────────────────────────────────── */

export default function ContactFlow() {
  const [role, setRole] = useState<Role | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  function reset() { setRole(null); setTopic(null); }
  function pickRole(r: Role) { setRole(r); setTopic(null); }

  /* Breadcrumb */
  const breadcrumb = (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
      <button onClick={reset} className={`font-medium transition ${!role ? 'text-gray-900 cursor-default' : 'hover:text-brand-600'}`}
        aria-current={!role ? 'page' : undefined}>
        Contact
      </button>
      {role && (
        <>
          <span aria-hidden="true">/</span>
          <button onClick={() => setTopic(null)} className={`font-medium transition ${!topic ? 'text-gray-900 cursor-default' : 'hover:text-brand-600'}`}
            aria-current={!topic ? 'page' : undefined}>
            {ROLES.find(r => r.id === role)?.label}
          </button>
        </>
      )}
      {topic && (
        <>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-gray-900" aria-current="page">{topic.label}</span>
        </>
      )}
    </nav>
  );

  /* Step 1 — pick role */
  if (!role) {
    return (
      <div>
        {breadcrumb}
        <h2 className="text-xl font-bold text-gray-900">What describes you best?</h2>
        <p className="mt-1 text-sm text-gray-500">We&apos;ll point you to the right help.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {ROLES.map(r => (
            <button key={r.id} onClick={() => pickRole(r.id)}
              className="group rounded-2xl border-2 border-gray-100 bg-white p-6 text-left transition hover:border-brand-400 hover:shadow-md">
              <span className="text-3xl">{r.icon}</span>
              <p className="mt-3 font-bold text-gray-900 group-hover:text-brand-700">{r.label}</p>
              <p className="mt-1 text-xs text-gray-500">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* Step 2 — pick topic */
  if (!topic) {
    return (
      <div>
        {breadcrumb}
        <h2 className="text-xl font-bold text-gray-900">What do you need help with?</h2>
        <p className="mt-1 text-sm text-gray-500">Choose a topic and we&apos;ll get you sorted fast.</p>
        <div className="mt-6 space-y-3">
          {TOPICS[role].map(t => (
            <button key={t.id} onClick={() => setTopic(t)}
              className="group flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 text-left transition hover:border-brand-400 hover:bg-brand-50">
              <span className="text-xl">{t.icon}</span>
              <span className="flex-1 font-medium text-gray-800 group-hover:text-brand-700">{t.label}</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 stroke-gray-400 group-hover:stroke-brand-500" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* Step 3 — answer or form */
  return (
    <div>
      {breadcrumb}
      <h2 className="text-xl font-bold text-gray-900">{topic.label}</h2>

      {topic.answer && (
        <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 px-6 py-5">
          <p className="text-sm leading-relaxed text-gray-700">{topic.answer}</p>
          {topic.cta && (
            <a href={topic.cta.href}
              className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
              {topic.cta.label}
            </a>
          )}
        </div>
      )}

      {/* Always show the form below (unless it's a pure-CTA with no form subject) */}
      {topic.formSubject !== undefined || !topic.answer ? (
        <div className="mt-6">
          <p className="mb-4 text-sm text-gray-500">
            {topic.answer ? 'Still need help? Send us a message.' : 'Send us a message and we\'ll get back to you within one business day.'}
          </p>
          <EmailForm subject={topic.formSubject} />
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-gray-500">
          Still stuck?{' '}
          <button onClick={() => setTopic(null)} className="font-semibold text-brand-600 hover:underline">
            Browse other topics
          </button>
        </p>
      )}
    </div>
  );
}
