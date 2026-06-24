import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function twilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );
}

/** Buy a new US local number and assign it to a landlord profile. */
async function provisionNumber(userId: string): Promise<string> {
  const client = twilioClient();
  const [available] = await client.availablePhoneNumbers('US').local.list({ limit: 1 });
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
export async function getOrProvisionVirtualPhone(userId: string): Promise<string | null> {
  try {
    const db = adminClient();
    const { data } = await db.from('profiles').select('virtual_phone, phone').eq('id', userId).single();

    // Only provision if the landlord has a real phone on file
    if (!data?.phone) return null;
    if (data.virtual_phone) return data.virtual_phone;

    return await provisionNumber(userId);
  } catch (err) {
    console.error('[twilio] getOrProvisionVirtualPhone error for', userId, err);
    return null;
  }
}

/** Look up the real phone number for an inbound virtual number. */
export async function getRealPhoneForVirtual(virtualPhone: string): Promise<string | null> {
  try {
    const db = adminClient();
    const { data } = await db.from('profiles').select('phone').eq('virtual_phone', virtualPhone).single();
    return data?.phone ?? null;
  } catch (err) {
    console.error('[twilio] getRealPhoneForVirtual error for', virtualPhone, err);
    return null;
  }
}
