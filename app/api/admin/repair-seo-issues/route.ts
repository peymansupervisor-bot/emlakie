import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';
import { cureSeoIssues } from '@/lib/seo-cure';
import { logError } from '@/lib/log-error';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = adminClient();

  const { data: latestRecord } = await sb
    .from('seo_audit_log')
    .select('run_id')
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single();

  if (!latestRecord) {
    return NextResponse.json({ error: 'No SEO audit runs found' }, { status: 404 });
  }

  const { data: records } = await sb
    .from('seo_audit_log')
    .select('page_path, issues, issue_count')
    .eq('run_id', latestRecord.run_id);

  try {
    const result = await cureSeoIssues(records ?? []);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logError('SEO Cure', msg, e instanceof Error ? e.stack : undefined);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
