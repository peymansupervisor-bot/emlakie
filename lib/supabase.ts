import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids "supabaseUrl is required" during SSR/prerender
// when NEXT_PUBLIC_* vars aren't available. All callers are in client-only
// code (useEffect, event handlers) so the client is never actually used
// during server-side rendering.
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    return (getClient() as unknown as Record<string, unknown>)[prop]
  },
})
