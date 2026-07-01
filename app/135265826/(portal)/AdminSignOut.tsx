'use client';

import { supabase } from '@/lib/supabase';

export default function AdminSignOut() {
  async function handleSignOut() {
    await supabase.auth.signOut();
    // Full navigation, not router.replace() — guarantees a clean reload of
    // the current deployment's JS instead of the SPA carrying stale client
    // router cache/state across sign-out/sign-in cycles in a long-lived tab.
    window.location.href = '/135265826/login';
  }
  return (
    <button onClick={handleSignOut}
      className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition">
      Sign out
    </button>
  );
}
