'use client';

import { supabase } from '@/lib/supabase';
import { Application, Conversation, LandlordListing, LandlordUser } from './types';
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

export async function sendOtp(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw new Error(error.message);
}

export async function verifyOtp(phone: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
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

export async function updateListing(id: string, payload: Record<string, unknown>): Promise<void> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to edit real listings.');
  await api(`/api/listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function extendListing(id: string): Promise<LandlordListing> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to extend listings.');
  return api<LandlordListing>(`/api/listings/${id}/extend`, { method: 'POST' });
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

export async function getApplications(listingId: string): Promise<Application[]> {
  if (isDemo()) return demoApplications.filter((a) => a.listing_id === listingId);
  return [];
}

export async function getConversations(): Promise<Conversation[]> {
  if (isDemo()) return demoConversations;
  return [];
}

export async function getCurrentUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? '';
}
