'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getConversations, getConversation, sendConversationMessage } from '@/lib/landlord/client';
import { Conversation, ConversationThread } from '@/lib/landlord/types';

const TEMPLATES = [
  { label: 'Schedule showing', text: 'Hi! Thanks for your interest. I\'d love to schedule a showing. Are you available this week? Please let me know a few times that work for you.' },
  { label: 'Request documents', text: 'Thank you for applying! To move forward, I\'ll need the following: proof of income (last 2 pay stubs), photo ID, and a completed rental application. Please send these at your earliest convenience.' },
  { label: 'Still available', text: 'Hi! Just wanted to let you know the property is still available. Let me know if you have any questions or would like to schedule a viewing.' },
  { label: 'Unit rented', text: 'Hi, thank you for your interest in the property. Unfortunately, the unit has been rented to another applicant. I hope you find the perfect home soon!' },
  { label: 'Need more info', text: 'Thanks for reaching out! Could you share a bit more about yourself — your move-in timeline, monthly income, and how many people will be living in the unit? This helps me match you with the right place.' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(searchParams.get('c'));
  const [thread, setThread] = useState<ConversationThread | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConversations().then(setConversations).catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    if (!activeId) { setThread(null); return; }
    setLoadingThread(true);
    getConversation(activeId).then((t) => { setThread(t); setLoadingThread(false); }).catch(() => setLoadingThread(false));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !activeId || sending) return;
    setSending(true);
    const body = reply.trim();
    setReply('');
    try {
      await sendConversationMessage(activeId, body);
      const updated = await getConversation(activeId);
      setThread(updated);
      setConversations((prev) => prev?.map((c) =>
        c.id === activeId ? { ...c, last_message: body, last_message_at: new Date().toISOString(), unread: false } : c
      ) ?? prev);
    } catch {
      setReply(body);
    } finally {
      setSending(false);
    }
  }

  if (!conversations) {
    return <p className="py-16 text-center text-gray-500">Loading messages…</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900">Messages</h1>

      {conversations.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-gray-400" fill="none" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-gray-900">No messages yet</p>
          <p className="mt-2 text-sm text-gray-600">
            Start a conversation from the <Link href="/landlord/leads" className="font-semibold text-brand-600 hover:underline">Leads</Link> tab by clicking "Message" on any applicant.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden rounded-2xl border border-gray-200 bg-white">

          {/* Left — conversation list */}
          <div className="flex w-72 shrink-0 flex-col border-r border-gray-200">
            <p className="border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition ${activeId === c.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 text-sm">
                    {(c.tenant_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{c.tenant_name ?? 'Tenant'}</p>
                      <span className="shrink-0 text-xs text-gray-400">{timeAgo(c.last_message_at)}</span>
                    </div>
                    {c.listing_title && <p className="truncate text-xs text-brand-600">{c.listing_title}</p>}
                    <p className="mt-0.5 truncate text-xs text-gray-500">{c.last_message ?? '—'}</p>
                  </div>
                  {c.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Right — thread */}
          <div className="flex flex-1 flex-col">
            {!activeId ? (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                Select a conversation to read messages
              </div>
            ) : loadingThread ? (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading…</div>
            ) : thread ? (
              <>
                {/* Thread header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{thread.tenant_name}</p>
                    {thread.listing && (
                      <Link href={`/rentals/${thread.listing.slug ?? thread.listing.id}`} target="_blank"
                        className="text-xs text-brand-600 hover:underline">
                        {thread.listing.address}, {thread.listing.city} →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {thread.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.from_landlord ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.from_landlord ? 'bg-brand-700 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{m.body}</p>
                        <p className={`mt-1.5 text-right text-xs ${m.from_landlord ? 'text-green-200' : 'text-gray-400'}`}>{formatTime(m.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Reply box */}
                <div className="border-t border-gray-200 p-4">
                  {/* Canned templates */}
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <button onClick={() => setShowTemplates((v) => !v)}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-brand-400 hover:text-brand-700">
                      {showTemplates ? 'Hide templates' : 'Quick replies ▾'}
                    </button>
                    {showTemplates && TEMPLATES.map((t) => (
                      <button key={t.label} onClick={() => { setReply(t.text); setShowTemplates(false); }}
                        className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100">
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSend} className="flex gap-3">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(e as unknown as React.FormEvent); }}
                      placeholder="Type a message… (⌘+Enter to send)"
                      rows={3}
                      className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button type="submit" disabled={!reply.trim() || sending}
                      className="self-end rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50">
                      {sending ? '…' : 'Send'}
                    </button>
                  </form>
                  <p className="mt-1.5 text-xs text-gray-400">Tenant will be notified by email</p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Could not load conversation</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
