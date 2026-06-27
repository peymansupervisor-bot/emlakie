'use client';

/**
 * Skeleton placeholder cards shown in the assistant panel before any real
 * listing recommendations are available.
 *
 * Phase 1B: Always shows skeleton state.
 * Phase 1C+: Replaced by real ListingRecommendation data from the session.
 *
 * Uses CSS pulse animation only — no JS, no API calls.
 */
export default function AssistantPlaceholderCards() {
  return (
    <div className="px-4 pb-4" aria-hidden="true">
      <p className="mb-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
        Recommended for you
      </p>
      <div className="flex flex-col gap-3">
        <SkeletonCard wide />
        <SkeletonCard />
      </div>
    </div>
  );
}

function SkeletonCard({ wide = false }: { wide?: boolean }) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
      {/* Photo placeholder */}
      <div className="h-16 w-20 flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />

      {/* Text placeholder */}
      <div className="flex flex-1 flex-col justify-center gap-2">
        <div className={`h-3 animate-pulse rounded bg-gray-200 ${wide ? 'w-4/5' : 'w-3/5'}`} />
        <div className="h-2.5 w-2/5 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-1.5">
          <div className="h-2 w-10 animate-pulse rounded bg-gray-200" />
          <div className="h-2 w-10 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
