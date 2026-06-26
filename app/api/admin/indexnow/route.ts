import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession } from '@/lib/moderator';
import { submitToIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { paths } = await req.json() as { paths?: string[] };
  if (!paths?.length) return NextResponse.json({ error: 'paths array required' }, { status: 400 });

  await submitToIndexNow(paths);
  return NextResponse.json({ ok: true, submitted: paths });
}
