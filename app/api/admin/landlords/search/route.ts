import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!await getModeratorSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const exclude = req.nextUrl.searchParams.get('exclude') ?? '';

  const sb = adminClient();
  let query = sb
    .from('profiles')
    .select('id, first_name, last_name, display_name, email, account_id')
    .neq('id', exclude)
    .limit(10);

  if (q) {
    query = query.ilike('account_id', `%${q}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ landlords: data ?? [] });
}
