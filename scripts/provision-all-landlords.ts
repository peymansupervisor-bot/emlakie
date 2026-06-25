import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: active } = await db.from('listings').select('landlord_id').eq('status', 'active');
  const landlordIds = Array.from(new Set((active ?? []).map(l => l.landlord_id).filter(Boolean)));

  const { data: landlords } = await db
    .from('profiles')
    .select('id, phone')
    .in('id', landlordIds)
    .not('phone', 'is', null)
    .is('virtual_phone', null);

  if (!landlords?.length) { console.log('No landlords to provision.'); return; }
  console.log(`Provisioning ${landlords.length} numbers...`);

  for (const landlord of landlords) {
    try {
      const [available] = await client.availablePhoneNumbers('US').local.list({ limit: 1 });
      if (!available) throw new Error('No numbers available');

      const purchased = await client.incomingPhoneNumbers.create({
        phoneNumber: available.phoneNumber,
        voiceUrl: 'https://emlakie.com/api/calls/forward',
        voiceMethod: 'POST',
      });

      await db.from('profiles').update({ virtual_phone: purchased.phoneNumber }).eq('id', landlord.id);
      console.log(`✓ ${landlord.phone} → ${purchased.phoneNumber}`);
    } catch (err) {
      console.error(`✗ ${landlord.id}:`, (err as Error).message);
    }
  }

  console.log('Done.');
}

main();
