import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getModeratorSession, adminClient } from '@/lib/moderator';
import { buildLandlordNewsEmail } from '@/lib/emails/landlord-news';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/landlord-news/send
 * Sends the "EMLAKIE Update" newsletter to landlords with an active listing
 * in the given city (or all landlords if city is omitted). Moderator-only.
 * Skips anyone who has unsubscribed. One personalized send per landlord —
 * never a single multi-recipient email — so each unsubscribe link is theirs alone.
 */
export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subject, badge, title, bodyHtml, city, dryRun } = await req.json();
    if (!subject || !title || !bodyHtml) {
      return NextResponse.json({ error: 'subject, title, and bodyHtml are required' }, { status: 400 });
    }

    const sb = adminClient();

    let listingQuery = sb.from('listings').select('landlord_id').eq('status', 'active');
    if (city) listingQuery = listingQuery.ilike('city', city);
    const { data: listingRows, error: listingErr } = await listingQuery;
    if (listingErr) throw listingErr;

    const landlordIds = Array.from(new Set((listingRows ?? []).map((r) => r.landlord_id).filter(Boolean)));
    if (!landlordIds.length) return NextResponse.json({ sent: 0, skipped: 0, recipients: [] });

    const { data: profiles, error: profileErr } = await sb
      .from('profiles')
      .select('id, email, first_name, display_name, news_unsubscribe_token, news_unsubscribed_at')
      .in('id', landlordIds);
    if (profileErr) throw profileErr;

    const recipients = (profiles ?? []).filter((p) => p.email && !p.news_unsubscribed_at);
    const skipped = (profiles?.length ?? 0) - recipients.length;

    if (dryRun) {
      return NextResponse.json({
        sent: 0,
        skipped,
        recipients: recipients.map((p) => ({ email: p.email, name: p.first_name ?? p.display_name ?? null })),
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
    let sent = 0;

    for (const p of recipients) {
      const unsubscribeUrl = `${siteUrl}/api/landlord/news-unsubscribe?token=${p.news_unsubscribe_token}`;
      const html = buildLandlordNewsEmail({ badge, title, bodyHtml, unsubscribeUrl });
      await resend.emails.send({
        from: 'EMLAKIE Update <noreply@emlakie.com>',
        replyTo: 'noreply@emlakie.com',
        to: p.email as string,
        subject,
        html,
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
      });
      sent++;
    }

    return NextResponse.json({ sent, skipped, recipients: recipients.map((p) => p.email) });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Landlord News Send', message: _msg, details: _stack, endpoint: 'POST /api/admin/landlord-news/send', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
