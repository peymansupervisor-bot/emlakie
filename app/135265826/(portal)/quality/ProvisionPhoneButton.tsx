'use client';

import { useState } from 'react';

interface Props {
  landlordId: string;
  zip?: string;
  city?: string;
  state?: string;
  hasProfilePhone: boolean;
}

export default function ProvisionPhoneButton({ landlordId, zip, city, state, hasProfilePhone }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleClick() {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/provision-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landlordId, zip, city, state }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Failed');
      } else {
        setStatus('done');
        setMessage(data.phone);
      }
    } catch {
      setStatus('error');
      setMessage('Network error');
    }
  }

  if (status === 'done') {
    return <span className="text-xs text-green-400 font-semibold">{message}</span>;
  }
  if (status === 'error') {
    return <span className="text-xs text-red-400">{message}</span>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading' || !hasProfilePhone}
      title={!hasProfilePhone ? 'Landlord has no profile phone — Twilio needs a area code to provision' : 'Provision Twilio virtual phone'}
      className="text-xs rounded-lg bg-orange-800 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-0.5 text-orange-200 font-semibold transition"
    >
      {status === 'loading' ? 'Provisioning…' : 'Provision phone'}
    </button>
  );
}
