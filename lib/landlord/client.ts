'use client';

import { supabase } from '@/lib/supabase';
import { Application, Conversation, ConversationThread, LandlordListing, LandlordProfile } from './types';

export async function isSignedIn(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getProfile(): Promise<LandlordProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('display_name, first_name, last_name, phone, phone_verified, email, account_id')
    .eq('id', user.id)
    .single();
  return data ?? null;
}

function toTitleCase(str: string): string {
  return str.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function updateProfile(payload: { first_name?: string; last_name?: string; phone: string; phone_verified?: boolean }): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const updates: Record<string, unknown> = {
    phone: payload.phone.replace(/\D/g, '').slice(-10),
    phone_verified: payload.phone_verified ?? false,
  };
  if (payload.first_name) updates.first_name = toTitleCase(payload.first_name).trim();
  if (payload.last_name) updates.last_name = toTitleCase(payload.last_name).trim();
  if (payload.first_name && payload.last_name) {
    updates.display_name = `${toTitleCase(payload.first_name)} ${toTitleCase(payload.last_name)}`.trim();
  }
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);
  if (error) throw new Error(error.message);
  // Fire welcome email on first profile completion (non-blocking)
  api('/api/welcome', { method: 'POST' }).catch(() => {});
}

export async function signInWithOAuth(provider: 'google' | 'facebook' | 'apple'): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/landlord` },
  });
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
  return api<LandlordListing[]>('/api/listings');
}

export async function getMyListing(id: string): Promise<LandlordListing | null> {
  const listings = await getMyListings();
  return listings.find((l) => l.id === id) ?? null;
}

export async function createListing(formData: FormData): Promise<LandlordListing> {
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
  return api<{ slug?: string | null }>(`/api/listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function extendListing(id: string): Promise<LandlordListing> {
  return api<LandlordListing>(`/api/listings/${id}/extend`, { method: 'POST' });
}

export async function deleteListing(id: string): Promise<void> {
  await api(`/api/listings/${id}`, { method: 'DELETE' });
}

export async function deactivateListing(id: string): Promise<void> {
  await api(`/api/listings/${id}/deactivate`, { method: 'POST' });
}

export async function markRented(
  id: string,
  opts?: { finalRent?: number; leaseTerm?: string }
): Promise<void> {
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

// ─── Applications & messages ──────────────────────────────────────────────────

export async function getAllApplications(): Promise<(Application & { listingAddress?: string })[]> {
  return api<(Application & { listingAddress?: string })[]>('/api/applications');
}

export async function getApplications(listingId: string): Promise<Application[]> {
  const token = await getToken();
  const res = await fetch(`/api/listings/${listingId}/applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function deleteApplication(listingId: string, appId: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(`/api/listings/${listingId}/applications/${appId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Delete failed');
}

export async function sendMessageToTenant(listingId: string, appId: string, message: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(`/api/listings/${listingId}/applications/${appId}/message`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to send message');
  }
}

export async function updateApplicationStatus(listingId: string, applicationId: string, status: 'pending' | 'approved' | 'rejected', note?: string): Promise<void> {
  const token = await getToken();
  await fetch(`/api/listings/${listingId}/applications`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId, status, note }),
  });
}

export async function getConversations(): Promise<Conversation[]> {
  return api<Conversation[]>('/api/conversations');
}

export async function getConversation(id: string): Promise<ConversationThread | null> {
  return api<ConversationThread>(`/api/conversations/${id}`).catch(() => null);
}

export async function openConversation(listingId: string, applicationId: string): Promise<string> {
  const { id } = await api<{ id: string }>('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listing_id: listingId, application_id: applicationId }),
  });
  return id;
}

export async function sendConversationMessage(conversationId: string, body: string): Promise<void> {
  await api(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
}

export async function getCurrentUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? '';
}
