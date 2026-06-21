import { NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!await getModeratorSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = adminClient();

  // Fetch all profiles ordered by created_at so we assign IDs chronologically
  const { data: profiles, error } = await sb
    .from('profiles')
    .select('id, account_id, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Find the current max numeric suffix across all existing IDs
  let maxNum = 0;
  for (const p of profiles ?? []) {
    if (p.account_id) {
      const m = p.account_id.match(/(\d+)$/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
  }

  const missing = (profiles ?? []).filter((p) => !p.account_id);

  if (missing.length === 0) {
    return NextResponse.json({ assigned: 0, message: 'All profiles already have an account ID.' });
  }

  let counter = maxNum;
  const updates: { id: string; account_id: string }[] = [];

  for (const p of missing) {
    counter++;
    updates.push({ id: p.id, account_id: `EM-${counter}` });
  }

  // Update each profile individually (Supabase doesn't support bulk upsert with different values per row easily)
  const errors: string[] = [];
  for (const u of updates) {
    const { error: upErr } = await sb
      .from('profiles')
      .update({ account_id: u.account_id })
      .eq('id', u.id);
    if (upErr) errors.push(`${u.id}: ${upErr.message}`);
  }

  return NextResponse.json({
    assigned: updates.length - errors.length,
    total: missing.length,
    errors: errors.length > 0 ? errors : undefined,
    preview: updates.slice(0, 10),
  });
}
