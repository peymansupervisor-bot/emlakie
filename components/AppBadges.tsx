const badgeClass =
  'flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-white transition hover:bg-gray-800';

export default function AppBadges() {
  return (
    <div className="flex flex-wrap gap-4">
      <a href="/app" className={badgeClass} aria-label="Download on the App Store">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
          <path d="M18.7 12.6c0-2.5 2-3.7 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.4-1-2.4-3.8zM16.3 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 3 1 .1 2.1-.6 2.8-1.4z" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide opacity-80">Download on the</span>
          <span className="block text-base font-semibold">App Store</span>
        </span>
      </a>

      <a href="/app" className={badgeClass} aria-label="Get it on Google Play">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
          <path d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1 9.9-9.9v-.2L3.7 1.7l-.1.1zm13.2 13.3-3.3-3.3v-.2l3.3-3.3 4 2.3c1.1.7 1.1 1.7 0 2.3l-4 2.2zm-.7.7L12.7 12 3.6 21.1c.4.4 1 .4 1.7 0l10.8-6.3zM3.6 2.9 12.7 12l3.4-3.4L5.3 2.4c-.7-.4-1.3-.4-1.7.1z" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide opacity-80">Get it on</span>
          <span className="block text-base font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}
