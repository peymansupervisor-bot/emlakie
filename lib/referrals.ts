import { createSupabaseAdmin } from '@/lib/supabase-server';
import { logError } from '@/lib/log-error';

// Referral reward: both the referrer and the referred landlord get a free
// 30-day listing Boost once the referred landlord publishes their first listing.
export const REWARD_BOOST_DAYS = 30;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';

type Admin = ReturnType<typeof createSupabaseAdmin>;

function newCode(): string {
  // 7-char A–Z/2–9 code (no ambiguous 0/O/1/I), e.g. "K7QF3MX".
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 7; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

/** Return the landlord's referral code, generating and saving one if absent. */
export async function ensureReferralCode(admin: Admin, userId: string): Promise<string | null> {
  const { data } = await admin.from('profiles').select('referral_code').eq('id', userId).single();
  if (data?.referral_code) return data.referral_code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    const { error } = await admin.from('profiles').update({ referral_code: code }).eq('id', userId);
    if (!error) return code;
    // unique collision — retry with a fresh code
  }
  await logError({ source: 'Referrals', message: 'Could not generate unique referral code', context: { userId } });
  return null;
}

export interface ReferralSummary {
  code: string | null;
  link: string | null;
  invited: number;     // total people who signed up via this landlord's code
  qualified: number;   // of those, how many published a first listing (rewarded)
  credits: { id: string; days: number }[]; // available, unredeemed boost credits
}

export async function getReferralSummary(userId: string): Promise<ReferralSummary> {
  const admin = createSupabaseAdmin();
  const code = await ensureReferralCode(admin, userId);

  const [{ data: refs }, { data: credits }] = await Promise.all([
    admin.from('referrals').select('status').eq('referrer_id', userId),
    admin.from('boost_credits').select('id, days').eq('user_id', userId).eq('status', 'available'),
  ]);

  const invited = refs?.length ?? 0;
  const qualified = (refs ?? []).filter((r) => r.status === 'qualified' || r.status === 'rewarded').length;

  return {
    code,
    link: code ? `${SITE_URL}/landlord/login?ref=${code}` : null,
    invited,
    qualified,
    credits: (credits ?? []).map((c) => ({ id: c.id as string, days: c.days as number })),
  };
}

/**
 * Attribute a newly signed-up landlord to a referrer by code. Idempotent and
 * safe: only sets referred_by if it's currently empty, ignores self-referral
 * and unknown codes. Creates a pending referral row.
 */
export async function attributeReferral(referredId: string, rawCode: string): Promise<void> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) return;
  const admin = createSupabaseAdmin();
  try {
    const { data: me } = await admin.from('profiles').select('referred_by').eq('id', referredId).single();
    if (me?.referred_by) return; // already attributed — never overwrite

    const { data: referrer } = await admin.from('profiles').select('id').eq('referral_code', code).single();
    if (!referrer || referrer.id === referredId) return; // unknown code or self-referral

    await admin.from('profiles').update({ referred_by: referrer.id }).eq('id', referredId);
    // unique(referred_id) guarantees one referral row per referred landlord
    await admin.from('referrals').insert({ referrer_id: referrer.id, referred_id: referredId, status: 'pending' });
  } catch (err) {
    await logError({ source: 'Referrals', message: err instanceof Error ? err.message : String(err), endpoint: 'attributeReferral', context: { referredId } });
  }
}

/** Extend a listing's boost by `days`, stacking on any remaining boost. */
async function applyBoost(admin: Admin, listingId: string, days: number): Promise<void> {
  const { data: listing } = await admin.from('listings').select('boosted_until').eq('id', listingId).single();
  const now = Date.now();
  const existing = listing?.boosted_until ? new Date(listing.boosted_until as string).getTime() : 0;
  const base = Math.max(now, existing);
  const boostedUntil = new Date(base + days * 24 * 60 * 60 * 1000);
  await admin.from('listings').update({ boosted_until: boostedUntil.toISOString() }).eq('id', listingId);
}

/** Redeem one of a landlord's available boost credits onto their own listing. */
export async function redeemBoostCredit(userId: string, creditId: string, listingId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = createSupabaseAdmin();
  // Verify the credit is the user's and still available
  const { data: credit } = await admin
    .from('boost_credits')
    .select('id, days, status')
    .eq('id', creditId)
    .eq('user_id', userId)
    .single();
  if (!credit || credit.status !== 'available') return { ok: false, error: 'Credit not available' };

  // Verify the listing belongs to the user
  const { data: listing } = await admin.from('listings').select('id, landlord_id').eq('id', listingId).single();
  if (!listing || listing.landlord_id !== userId) return { ok: false, error: 'Listing not found' };

  await applyBoost(admin, listingId, credit.days as number);
  await admin
    .from('boost_credits')
    .update({ status: 'redeemed', redeemed_listing_id: listingId, redeemed_at: new Date().toISOString() })
    .eq('id', creditId);
  return { ok: true };
}

async function notify(toEmail: string | null | undefined, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !toEmail) return;
  try {
    const { Resend } = await import('resend');
    await new Resend(key).emails.send({ from: 'EMLAKIE <noreply@emlakie.com>', to: toEmail, subject, html });
  } catch {
    // email is best-effort — never block the reward on it
  }
}

/**
 * Called after a landlord publishes a listing. If this is their FIRST listing
 * and they were referred, qualify the referral and grant both parties a free
 * 30-day boost — auto-applied to the new landlord's listing, and added as a
 * redeemable credit for the referrer.
 */
export async function qualifyReferralOnFirstListing(referredId: string, newListingId: string): Promise<void> {
  const admin = createSupabaseAdmin();
  try {
    // First listing only (the just-inserted one should be their only one)
    const { count } = await admin
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('landlord_id', referredId);
    if ((count ?? 0) !== 1) return;

    // Must have a still-pending referral
    const { data: referral } = await admin
      .from('referrals')
      .select('id, referrer_id, status')
      .eq('referred_id', referredId)
      .single();
    if (!referral || referral.status !== 'pending') return;

    // Grant credits: referrer keeps a redeemable credit; referred's is auto-applied now.
    await admin.from('boost_credits').insert([
      { user_id: referral.referrer_id, days: REWARD_BOOST_DAYS, source: 'referral', status: 'available' },
      { user_id: referredId, days: REWARD_BOOST_DAYS, source: 'referral', status: 'redeemed', redeemed_listing_id: newListingId, redeemed_at: new Date().toISOString() },
    ]);
    await applyBoost(admin, newListingId, REWARD_BOOST_DAYS);

    await admin.from('referrals').update({ status: 'rewarded', qualified_at: new Date().toISOString() }).eq('id', referral.id);

    // Notify both (best-effort)
    const { data: people } = await admin
      .from('profiles')
      .select('id, email, first_name')
      .in('id', [referral.referrer_id, referredId]);
    const referrer = people?.find((p) => p.id === referral.referrer_id);
    const referred = people?.find((p) => p.id === referredId);

    await notify(
      referrer?.email as string | undefined,
      'Your referral reward: a free 30-day Boost 🎉',
      `<p>Good news${referrer?.first_name ? `, ${referrer.first_name}` : ''}! A landlord you referred just published their first listing on EMLAKIE.</p>
       <p>You've earned a <strong>free 30-day listing Boost</strong>. Redeem it any time from your <a href="${SITE_URL}/landlord/refer">Refer &amp; Earn</a> page.</p>`,
    );
    await notify(
      referred?.email as string | undefined,
      'Your first listing is boosted free for 30 days 🚀',
      `<p>Welcome to EMLAKIE${referred?.first_name ? `, ${referred.first_name}` : ''}! Because you joined through a referral, your first listing is now <strong>boosted free for 30 days</strong> — it'll get premium placement in search results.</p>`,
    );
  } catch (err) {
    await logError({ source: 'Referrals', message: err instanceof Error ? err.message : String(err), endpoint: 'qualifyReferralOnFirstListing', context: { referredId, newListingId } });
  }
}
