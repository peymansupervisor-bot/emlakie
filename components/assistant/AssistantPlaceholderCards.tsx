'use client';

import type { ListingRecommendation } from '@/types/assistant';

interface AssistantPlaceholderCardsProps {
  recommendations?: ListingRecommendation[];
}

/**
 * Shows either skeleton cards (Phase 1B/1C idle state) or mock recommendation
 * cards when the session has returned results.
 *
 * Phase 1C: recommendations are mock data from MockTransport.
 * Phase 1D+: same component, real ListingRecommendation data.
 */
export default function AssistantPlaceholderCards({
  recommendations,
}: AssistantPlaceholderCardsProps) {
  if (recommendations && recommendations.length > 0) {
    return (
      <div className="px-4 pb-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Recommended for you
        </p>
        <div className="flex flex-col gap-3">
          {recommendations.map((rec) => (
            <MockRecommendationCard key={rec.listingId} rec={rec} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4" aria-hidden="true">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
        Recommended for you
      </p>
      <div className="flex flex-col gap-3">
        <SkeletonCard wide />
        <SkeletonCard />
      </div>
    </div>
  );
}

function MockRecommendationCard({ rec }: { rec: ListingRecommendation }) {
  return (
    <div className="flex gap-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3">
      {/* Photo placeholder */}
      <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100">
        <svg
          className="h-6 w-6 text-brand-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
            Demo #{rec.rank}
          </span>
          <span className="text-[10px] text-brand-600">
            {Math.round(rec.confidence * 100)}% match
          </span>
        </div>
        <p className="text-xs leading-relaxed text-gray-600 line-clamp-2">
          {rec.explanation}
        </p>
      </div>
    </div>
  );
}

function SkeletonCard({ wide = false }: { wide?: boolean }) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="h-16 w-20 flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />
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
