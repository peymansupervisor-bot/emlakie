import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase-server';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/** Returns the current user's id if they are a moderator, otherwise null. */
export async function getModeratorSession(): Promise<{ userId: string; email: string } | null> {
  try {
    const sb = await createSupabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const admin = adminClient();
    const { data } = await admin
      .from('moderators')
      .select('email')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) return null;
    return { userId: user.id, email: data.email };
  } catch {
    return null;
  }
}

export { adminClient };
