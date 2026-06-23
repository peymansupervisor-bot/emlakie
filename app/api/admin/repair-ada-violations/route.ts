import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';
import { cureViolations } from '@/lib/ada-cure';
import { logError } from '@/lib/log-error';

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = adminClient();

  const { data: latestRecord } = await sb
    .from('ada_audit_log')
    .select('run_id')
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single();

  if (!latestRecord) {
    return NextResponse.json({ error: 'No audit runs found' }, { status: 404 });
  }

  const { data: records } = await sb
    .from('ada_audit_log')
    .select('page_path, violations, violation_count')
    .eq('run_id', latestRecord.run_id);

  try {
    const result = await cureViolations(records ?? []);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logError('ADA Cure', msg, e instanceof Error ? e.stack : undefined);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
