import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';
import { logError } from './log-error';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function twilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );
}

/** Buy a new US local number and assign it to a landlord profile. */
async function provisionNumber(userId: string, postalCode?: string, city?: string, state?: string): Promise<string> {
  const client = twilioClient();

  let available = null;

  // 1. Try zip code first (most local)
  if (postalCode) {
    const results = await client.availablePhoneNumbers('US').local.list({ inPostalCode: postalCode, limit: 5 });
    available = results[0] ?? null;
  }

  // 2. Try city + state if zip pool is too small
  if (!available && city && state) {
    const results = await client.availablePhoneNumbers('US').local.list({ inLocality: city, inRegion: state, limit: 5 });
    available = results[0] ?? null;
  }

  // 3. Try state-only as last regional fallback
  if (!available && state) {
    const results = await client.availablePhoneNumbers('US').local.list({ inRegion: state, limit: 5 });
    available = results[0] ?? null;
  }

  // 4. Fall back to any US local number
  if (!available) {
    const results = await client.availablePhoneNumbers('US').local.list({ limit: 1 });
    available = results[0] ?? null;
  }

  if (!available) throw new Error('No phone numbers available');

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: available.phoneNumber,
    voiceUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com'}/api/calls/forward`,
    voiceMethod: 'POST',
  });

  const db = adminClient();
  await db.from('profiles').update({ virtual_phone: purchased.phoneNumber }).eq('id', userId);

  return purchased.phoneNumber;
}

/** Return the landlord's virtual number, provisioning one if needed. */
export async function getOrProvisionVirtualPhone(userId: string, postalCode?: string, city?: string, state?: string): Promise<string | null> {
  try {
    const db = adminClient();
    const { data } = await db.from('profiles').select('virtual_phone, phone').eq('id', userId).single();

    if (data?.virtual_phone) return data.virtual_phone;

    return await provisionNumber(userId, postalCode, city, state);
  } catch (err) {
    console.error('[twilio] getOrProvisionVirtualPhone error for', userId, err);
    await logError({
      source: 'Twilio Provision',
      message: err instanceof Error ? err.message : String(err),
      details: err instanceof Error ? err.stack : undefined,
      user_id: userId,
      endpoint: 'getOrProvisionVirtualPhone',
      context: { postalCode, city, state },
    });
    return null;
  }
}

/**
 * Release the landlord's virtual phone number if they have no remaining active listings.
 * Called after a listing status change or deletion.
 */
export async function maybeReleaseVirtualPhone(userId: string): Promise<void> {
  try {
    const db = adminClient();

    // Check if any active listings remain
    const { count } = await db
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('landlord_id', userId)
      .eq('status', 'active');

    if ((count ?? 0) > 0) return; // still has active listings — keep the number

    // Fetch their virtual number
    const { data: profile } = await db
      .from('profiles')
      .select('virtual_phone')
      .eq('id', userId)
      .single();

    if (!profile?.virtual_phone) return;

    // Release from Twilio
    const client = twilioClient();
    const numbers = await client.incomingPhoneNumbers.list({ phoneNumber: profile.virtual_phone });
    if (numbers[0]) await client.incomingPhoneNumbers(numbers[0].sid).remove();

    // Clear from profile
    await db.from('profiles').update({ virtual_phone: null }).eq('id', userId);
  } catch (err) {
    console.error('[twilio] maybeReleaseVirtualPhone error for', userId, err);
    await logError({
      source: 'Twilio Release',
      message: err instanceof Error ? err.message : String(err),
      details: err instanceof Error ? err.stack : undefined,
      user_id: userId,
      endpoint: 'maybeReleaseVirtualPhone',
    });
  }
}

/** Look up the real phone number for an inbound virtual number. */
export async function getRealPhoneForVirtual(virtualPhone: string): Promise<string | null> {
  try {
    // Must use service key — call routing is server-side only and the anon key
    // is blocked by RLS since we restricted call_routing_lookup to service_role.
    const db = adminClient();
    const { data, error } = await db.from('profiles').select('phone').eq('virtual_phone', virtualPhone).single();
    if (error) {
      console.error('[twilio] getRealPhoneForVirtual DB error for', virtualPhone, error);
      await logError({
        source: 'Twilio Call Forward',
        message: error.message,
        endpoint: 'getRealPhoneForVirtual',
        context: { virtualPhone },
      });
      return null;
    }
    if (!data?.phone) {
      // A live listing number that maps to no real phone — an inbound caller would hear nothing.
      await logError({
        source: 'Twilio Call Forward',
        message: 'No real phone mapped for inbound virtual number',
        endpoint: 'getRealPhoneForVirtual',
        context: { virtualPhone },
      });
    }
    return data?.phone ?? null;
  } catch (err) {
    console.error('[twilio] getRealPhoneForVirtual error for', virtualPhone, err);
    await logError({
      source: 'Twilio Call Forward',
      message: err instanceof Error ? err.message : String(err),
      details: err instanceof Error ? err.stack : undefined,
      endpoint: 'getRealPhoneForVirtual',
      context: { virtualPhone },
    });
    return null;
  }
}
