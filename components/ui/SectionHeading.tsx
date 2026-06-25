import Link from 'next/link';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  seeAllHref,
  seeAllLabel = 'View all →',
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`mb-7 flex items-baseline justify-between gap-4 ${className}`}>
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-600">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="shrink-0 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          {seeAllLabel}
        </Link>
      )}
    </div>
  );
}
