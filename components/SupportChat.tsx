'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTIONS = [
  'My listing isn\'t showing up in search',
  'I\'m not receiving emails from the site',
  'How do I edit my listing?',
  'I want to cancel my email alert',
  'A tenant contacted me — where do I see it?',
  'How do I upload photos to my listing?',
];

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi! I'm the EMLAKIE support agent. I can look into your account, fix issues directly, and answer any questions about using the site. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  const prevLengthRef = useRef(1);
  useEffect(() => {
    if (messages.length > prevLengthRef.current || loading) {
      const el = messagesRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
    prevLengthRef.current = messages.length;
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, email }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: data.answer ?? 'Something went wrong. Please try again.' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-card overflow-hidden">
      {/* Email bar */}
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <label className="flex items-center gap-3 text-sm">
          <span className="shrink-0 font-medium text-gray-600">Your email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="so we can look up your account"
            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </label>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex flex-col gap-4 overflow-y-auto p-5" style={{ minHeight: 360, maxHeight: 480 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                E
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-br-sm bg-green-600 text-white'
                  : 'rounded-bl-sm bg-gray-100 text-gray-800'
              }`}
            >
              {msg.text.split('\n').map((line, i) => {
                const formatted = line
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>');
                return <p key={i} className={i > 0 ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: formatted }} />;
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              E
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips — only shown before user sends first message */}
      {messages.length === 1 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-gray-400">Common questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-green-400 hover:bg-green-50 hover:text-green-700"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-100 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-end gap-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Describe your issue…"
            rows={2}
            className="min-w-0 flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 disabled:opacity-40"
            aria-label="Send"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-gray-400">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
