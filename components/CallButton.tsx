'use client';

interface Props {
  virtualPhone: string;
}

export default function CallButton({ virtualPhone }: Props) {
  const formatted = virtualPhone.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

  return (
    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Call landlord</p>
      <a
        href={`tel:${virtualPhone}`}
        className="mt-2 flex items-center gap-3 rounded-xl bg-brand-600 px-4 py-3 text-white transition hover:bg-brand-700"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span className="font-semibold">{formatted}</span>
      </a>
      <p className="mt-2 text-center text-xs text-gray-400">Your number stays private</p>
    </div>
  );
}
