'use client';

import { Application, Conversation, LandlordListing, LandlordUser } from './types';
import { demoApplications, demoConversations, demoListings } from './demo-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.emlakie.com/api';
const TOKEN_KEY = 'emlakie_token';
const DEMO_KEY = 'emlakie_demo';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isDemo(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_KEY) === '1';
}

export function isSignedIn(): boolean {
  return isDemo() || !!getToken();
}

export function enterDemo() {
  localStorage.setItem(DEMO_KEY, '1');
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DEMO_KEY);
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<void> {
  await api('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
}

export async function verifyOtp(phone: string, code: string): Promise<LandlordUser> {
  const data = await api<{ token: string; user: LandlordUser }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.removeItem(DEMO_KEY);
  return data.user;
}

// ─── Listings ────────────────────────────────────────────────────────────────

export async function getMyListings(): Promise<LandlordListing[]> {
  if (isDemo()) return demoListings;
  return api<LandlordListing[]>('/listings/mine');
}

export async function getMyListing(id: string): Promise<LandlordListing | null> {
  if (isDemo()) return demoListings.find((l) => l.id === id) ?? null;
  const listings = await getMyListings();
  return listings.find((l) => l.id === id) ?? null;
}

export async function createListing(formData: FormData): Promise<LandlordListing> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to publish real listings.');
  const token = getToken();
  const res = await fetch(`${API_URL}/listings`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Upload failed (${res.status})`);
  return data as LandlordListing;
}

export async function updateListing(id: string, payload: Record<string, unknown>): Promise<void> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to edit real listings.');
  await api(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function extendListing(id: string): Promise<LandlordListing> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to extend listings.');
  return api<LandlordListing>(`/listings/${id}/extend`, { method: 'POST' });
}

export async function deactivateListing(id: string): Promise<void> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to deactivate listings.');
  await api(`/listings/${id}/deactivate`, { method: 'POST' });
}

export async function markRented(id: string): Promise<void> {
  if (isDemo()) throw new Error('Demo mode: sign in with your phone to update listings.');
  await api(`/listings/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'rented' }) });
}

// ─── Applications & messages ────────────────────────────────────────────────

export async function getApplications(listingId: string): Promise<Application[]> {
  if (isDemo()) return demoApplications.filter((a) => a.listing_id === listingId);
  return api<Application[]>(`/listings/${listingId}/applications`);
}

export async function getConversations(): Promise<Conversation[]> {
  if (isDemo()) return demoConversations;
  return api<Conversation[]>('/messages/conversations');
}
