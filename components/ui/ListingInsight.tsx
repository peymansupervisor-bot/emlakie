interface ListingInsightProps {
  text: string;
  className?: string;
  // Future: when personalization is supported, pass searchTerms here
  // searchTerms?: string[]
}

export default function ListingInsight({ text, className = '' }: ListingInsightProps) {
  return (
    <div className={`rounded-xl bg-brand-50 px-3.5 py-3 ${className}`}>
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3 shrink-0"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
        </svg>
        Why you&apos;ll like it
      </p>
      <p className="mt-1.5 text-[13px] font-medium leading-snug text-gray-700">
        {text}
      </p>
    </div>
  );
}
