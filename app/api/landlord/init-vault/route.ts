import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Subfolder structure created for every new landlord's vault
const VAULT_FOLDERS = [
  'photos/.keep',      // property photos (organized by listing id inside)
  'documents/.keep',   // leases, agreements, addendums
  'media/.keep',       // floor plans, videos, other media
];

/**
 * POST /api/landlord/init-vault
 * Creates the landlord's private storage folder structure on first login.
 * Safe to call multiple times — idempotent (skips if already initialized).
 */
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createSupabaseAdmin();

  // Check if already initialized
  const { data: profile } = await admin
    .from('profiles')
    .select('folder_initialized_at')
    .eq('id', user.id)
    .single();

  if (profile?.folder_initialized_at) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Create placeholder files in each subfolder to establish the directory structure
  const errors: string[] = [];
  for (const path of VAULT_FOLDERS) {
    const fullPath = `${user.id}/${path}`;
    const { error } = await admin.storage
      .from('listing-photos')
      .upload(fullPath, new Blob([''], { type: 'text/plain' }), { upsert: true });
    if (error && !error.message.includes('already exists')) {
      errors.push(`${path}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Partial init failure', details: errors }, { status: 500 });
  }

  // Mark as initialized
  await admin
    .from('profiles')
    .update({ folder_initialized_at: new Date().toISOString() })
    .eq('id', user.id);

  return NextResponse.json({ ok: true });
}
