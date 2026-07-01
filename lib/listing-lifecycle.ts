export const LISTING_PERIOD_DAYS = 45;
export const LISTING_PERIOD_MS = LISTING_PERIOD_DAYS * 24 * 60 * 60 * 1000;

// A listing gets its initial 45-day period for free, plus up to this many 45-day
// extensions (2 = 135 days total). Once exhausted, it can no longer be extended and
// permanently goes off-market when expires_at passes.
export const MAX_LISTING_EXTENSIONS = 2;
