import { Listing } from '../types';

export interface LandlordUser {
  id: string;
  phone: string;
  name?: string;
  role?: 'tenant' | 'landlord';
}

export interface LandlordProfile {
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  phone_verified?: boolean;
  email?: string | null;
  account_id?: string | null;
}

export interface Application {
  id: string;
  listing_id: string;
  tenant_name?: string;
  tenant_phone?: string;
  message: string;
  income: number;
  credit_score?: number | null;
  move_in?: string | null;
  source?: string | null;
  ai_match_score?: number;
  ai_summary?: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing_title?: string;
  tenant_name?: string;
  last_message?: string;
  last_message_at: string;
  unread?: boolean;
}

export type LandlordListing = Listing & {
  view_count?: number;
  applicant_count?: number;
  expiresAt?: string | null;
};
