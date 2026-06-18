'use client';

import { useEffect, useState } from 'react';
import { getConversations } from '@/lib/landlord/client';
import { Conversation } from '@/lib/landlord/types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);

  useEffect(() => {
    getConversations().then(setConversations).catch(() => setConversations([]));
  }, []);

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
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-gray-900">No messages yet</p>
          <p className="mt-2 text-sm text-gray-600">
            When renters send you messages they'll appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200">
          {conversations.map((c) => (
            <div key={c.id}
              className="flex items-start gap-4 bg-white px-5 py-4 transition hover:bg-gray-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                {(c.tenant_name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">{c.tenant_name ?? 'Renter'}</p>
                  <span className="shrink-0 text-xs text-gray-500">{timeAgo(c.last_message_at)}</span>
                </div>
                {c.listing_title && (
                  <p className="text-xs font-medium text-brand-600">{c.listing_title}</p>
                )}
                <p className="mt-0.5 truncate text-sm text-gray-600">{c.last_message ?? '—'}</p>
              </div>
              {c.unread && (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Full messaging is available in the Emlakie app.{' '}
        <a href="/app" className="font-semibold text-brand-600 hover:text-brand-700">
          Download →
        </a>
      </p>
    </div>
  );
}
