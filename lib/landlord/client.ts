'use client';

import { supabase } from '@/lib/supabase';
import { Application, Conversation, LandlordListing, LandlordProfile, LandlordUser } from './types';
import { demoApplications, demoConversations, demoListings } from './demo-data';

const DEMO_KEY = 'emlakie_demo';

export function isDemo(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_KEY) === '1';
}

export function enterDemo() {
  if (typeof window !== 'undefined') localStorage.setItem(DEMO_KEY, '1');
}

export async function isSignedIn(): Promise<boolean> {
  if (isDemo()) return true;
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function signOut() {
  if (typeof window !== 'undefined') localStorage.removeItem(DEMO_KEY);
  await supabase.auth.signOut();
}

export async function getProfile(): Promise<LandlordProfile | null> {
  if (isDemo()) return { display_name: 'Demo User', account_id: 'EML-000' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('display_name, first_name, last_name, phone, email, account_id')
    .eq('id', user.id)
    .single();
  return data ?? null;
}

export async function updateProfile(payload: { first_name: string; last_name: string; phone: string }): Promise<void> {
  if (isDemo()) throw new Error('Demo mode: sign in to update your profile.');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const display_name = `${payload.first_name.trim()} ${payload.last_name.trim()}`.trim();
  const { error } = await supabase
    .from('profiles')
    .update({ first_name: payload.first_name.trim(), last_name: payload.last_name.trim(), phone: payload.phone.trim(), display_name })
    .eq('id', user.id);
  if (error) throw new Error(error.message);
}

export async function sendOtp(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw new Error(error.message);
}

export async function verifyOtp(phone: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw new Error(error.message);
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signUpWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/landlord` } });
  if (error) throw new Error(error.message);
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/landlord/reset-password` });
  if (error) throw new Error(error.message);
}

export async function sendEmailOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/landlord`,
    },
  });
  if (error) throw new Error(error.message);
}

export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw new Error(error.message);
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

// ─── Listings ────────────────────────────────────────────────────────────────

export async function getMyListings(): Promise<LandlordListing[]> {
  if (isDemo()) return demoListings;
  return api<LandlordListing[]>('/api/listings');
}

export async function getMyListing(id: string): Promise<LandlordListing | null> {
  if (isDemo()) return demoListings.find((l) => l.id === id) ?? null;
  const listings = await getMyListings();
  return listings.find((l) => l.id === id) ?? null;
}

export async function createListing(formData: FormData): Promise<LandlordListing> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to publish real listings.');
  const token = await getToken();
  if (!token) throw new Error('Not signed in.');
  const res = await fetch('/api/listings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    signal: AbortSignal.timeout(60000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Upload failed (${res.status})`);
  return data as LandlordListing;
}

export async function updateListing(id: string, payload: Record<string, unknown>): Promise<{ slug?: string | null }> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to edit real listings.');
  return api<{ slug?: string | null }>(`/api/listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function extendListing(id: string): Promise<LandlordListing> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to extend listings.');
  return api<LandlordListing>(`/api/listings/${id}/extend`, { method: 'POST' });
}

export async function deleteListing(id: string): Promise<void> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to delete listings.');
  await api(`/api/listings/${id}`, { method: 'DELETE' });
}

export async function deactivateListing(id: string): Promise<void> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to deactivate listings.');
  await api(`/api/listings/${id}/deactivate`, { method: 'POST' });
}

export async function markRented(
  id: string,
  opts?: { finalRent?: number; leaseTerm?: string }
): Promise<void> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to update listings.');
  await api(`/api/listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'rented',
      rented_at: new Date().toISOString(),
      ...(opts?.finalRent  ? { final_rent: opts.finalRent }   : {}),
      ...(opts?.leaseTerm  ? { lease_term: opts.leaseTerm }   : {}),
    }),
  });
}

// ─── Applications & messages (still demo only until backend grows) ────────────

export async function getAllApplications(): Promise<(Application & { listingAddress?: string })[]> {
  if (isDemo()) return demoApplications.map((a) => ({ ...a, listingAddress: demoListings.find((l) => l.id === a.listing_id)?.address }));
  return api<(Application & { listingAddress?: string })[]>('/api/applications');
}

export async function getApplications(listingId: string): Promise<Application[]> {
  if (isDemo()) return demoApplications.filter((a) => a.listing_id === listingId);
  const token = await getToken();
  const res = await fetch(`/api/listings/${listingId}/applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function updateApplicationStatus(listingId: string, applicationId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
  if (isDemo()) return;
  const token = await getToken();
  await fetch(`/api/listings/${listingId}/applications`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId, status }),
  });
}

export async function getConversations(): Promise<Conversation[]> {
  if (isDemo()) return demoConversations;
  return [];
}

export async function getCurrentUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? '';
}
