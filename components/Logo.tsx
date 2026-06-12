export default function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-full w-auto" aria-hidden="true">
        <path
          d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z"
          className="fill-brand-600"
        />
      </svg>
      <span className="text-2xl font-extrabold tracking-tight text-gray-900">
        EMLA<span className="text-brand-600">KIE</span>
      </span>
    </span>
  );
}
