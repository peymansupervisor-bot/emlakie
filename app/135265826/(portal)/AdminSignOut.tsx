'use client';

export default function AdminSignOut() {
  async function handleSignOut() {
    // The moderator session lives in cookies, set via the @supabase/ssr
    // server client in /api/admin/login. supabase.auth.signOut() from
    // lib/supabase.ts (a plain @supabase/supabase-js client) only clears
    // its own localStorage session and never touches those cookies, so
    // it left the real session — the one every page's middleware and
    // getModeratorSession() check — fully intact. Signing out has to go
    // through a server route that shares the same cookie-based client.
    await fetch('/api/admin/moderator-logout', { method: 'POST' });
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
