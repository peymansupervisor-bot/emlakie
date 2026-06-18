import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function resendClient() { return new Resend(process.env.RESEND_API_KEY); }

export type ToolResult = string;

// Tool definitions for Claude
export const tools = [
  {
    name: 'lookup_landlord_listings',
    description: 'Find all listings belonging to a landlord by their email address. Use this to diagnose issues with a landlord\'s listings.',
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'The landlord\'s email address' },
      },
      required: ['email'],
    },
  },
  {
    name: 'get_listing_details',
    description: 'Get full details of a specific listing by ID, including status, photos, and all fields.',
    input_schema: {
      type: 'object',
      properties: {
        listing_id: { type: 'string', description: 'The listing ID (UUID)' },
      },
      required: ['listing_id'],
    },
  },
  {
    name: 'update_listing',
    description: 'Fix a listing by updating one or more fields. Use this to publish a draft, fix pricing, correct status, etc.',
    input_schema: {
      type: 'object',
      properties: {
        listing_id: { type: 'string', description: 'The listing ID to update' },
        fields: {
          type: 'object',
          description: 'Key-value pairs of fields to update, e.g. {"status": "active"} or {"price": 1500}',
        },
      },
      required: ['listing_id', 'fields'],
    },
  },
  {
    name: 'lookup_tenant_inquiries',
    description: 'Find all inquiries submitted by a tenant using their email address.',
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'The tenant\'s email address' },
      },
      required: ['email'],
    },
  },
  {
    name: 'lookup_saved_searches',
    description: 'Find saved search alerts for a user by email.',
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'The user\'s email address' },
      },
      required: ['email'],
    },
  },
  {
    name: 'delete_saved_search',
    description: 'Delete a saved search alert by its ID. Use when user wants to cancel an alert.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The saved search ID to delete' },
      },
      required: ['id'],
    },
  },
  {
    name: 'resend_verification_email',
    description: 'Resend the email verification link for a saved search alert.',
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'The user\'s email address' },
      },
      required: ['email'],
    },
  },
  {
    name: 'check_listing_inquiries',
    description: 'Get all inquiries received for a specific listing, to help landlords see who has contacted them.',
    input_schema: {
      type: 'object',
      properties: {
        listing_id: { type: 'string', description: 'The listing ID' },
      },
      required: ['listing_id'],
    },
  },
] as const;

export type ToolName = typeof tools[number]['name'];

export async function runTool(name: ToolName, input: Record<string, unknown>): Promise<ToolResult> {
  const db = sb();

  switch (name) {
    case 'lookup_landlord_listings': {
      const { data } = await db
        .from('listings')
        .select('id, title, status, price, city, state, bedrooms, bathrooms, created_at, photos')
        .eq('landlord_email', input.email)
        .order('created_at', { ascending: false });
      if (!data?.length) return `No listings found for ${input.email}.`;
      return JSON.stringify(data.map(l => ({
        id: l.id,
        title: l.title,
        status: l.status,
        price: l.price,
        location: `${l.city}, ${l.state}`,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        photoCount: l.photos?.length ?? 0,
        created: l.created_at,
      })));
    }

    case 'get_listing_details': {
      const { data } = await db
        .from('listings')
        .select('*')
        .eq('id', input.listing_id)
        .single();
      if (!data) return `Listing ${input.listing_id} not found.`;
      return JSON.stringify(data);
    }

    case 'update_listing': {
      const { error } = await db
        .from('listings')
        .update(input.fields as Record<string, unknown>)
        .eq('id', input.listing_id);
      if (error) return `Failed to update listing: ${error.message}`;
      return `Successfully updated listing ${input.listing_id} with fields: ${JSON.stringify(input.fields)}`;
    }

    case 'lookup_tenant_inquiries': {
      const { data } = await db
        .from('applications')
        .select('id, listing_id, status, message, created_at')
        .eq('email', input.email)
        .order('created_at', { ascending: false });
      if (!data?.length) return `No inquiries found for ${input.email}.`;
      return JSON.stringify(data);
    }

    case 'lookup_saved_searches': {
      const { data } = await db
        .from('saved_searches')
        .select('id, label, verified, created_at, last_notified_at')
        .eq('email', input.email);
      if (!data?.length) return `No saved searches found for ${input.email}.`;
      return JSON.stringify(data);
    }

    case 'delete_saved_search': {
      const { error } = await db
        .from('saved_searches')
        .delete()
        .eq('id', input.id);
      if (error) return `Failed to delete saved search: ${error.message}`;
      return `Saved search ${input.id} deleted successfully.`;
    }

    case 'resend_verification_email': {
      const { data } = await db
        .from('saved_searches')
        .select('verify_token, label')
        .eq('email', input.email)
        .eq('verified', false)
        .single();
      if (!data) return `No unverified saved search found for ${input.email}.`;
      const verifyUrl = `https://emlakie.com/api/saved-searches/verify?token=${data.verify_token}`;
      await resendClient().emails.send({
        from: 'EMLAKIE Alerts <alerts@emlakie.com>',
        to: input.email as string,
        subject: `Confirm your rental alert: ${data.label}`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px">
          <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 16px">EMLAKIE</p>
          <h1 style="font-size:18px;font-weight:800;color:#111827;margin:0 0 8px">Confirm your alert</h1>
          <p style="color:#374151;margin:0 0 24px">Click below to activate your alert for <strong>${data.label}</strong>.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px">Confirm Alert</a>
        </div>`,
      });
      return `Verification email resent to ${input.email}.`;
    }

    case 'check_listing_inquiries': {
      const { data } = await db
        .from('applications')
        .select('id, tenant_name, email, phone, message, status, created_at')
        .eq('listing_id', input.listing_id)
        .order('created_at', { ascending: false });
      if (!data?.length) return `No inquiries found for listing ${input.listing_id}.`;
      return JSON.stringify(data);
    }

    default:
      return 'Unknown tool.';
  }
}
