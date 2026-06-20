'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminSignOut() {
  const router = useRouter();
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/135265826/login');
  }
  return (
    <button onClick={handleSignOut}
      className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition">
      Sign out
    </button>
  );
}
