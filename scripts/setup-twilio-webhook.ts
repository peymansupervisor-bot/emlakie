import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

async function main() {
  const numbers = await client.incomingPhoneNumbers.list({ phoneNumber: process.env.TWILIO_PHONE_NUMBER });
  if (!numbers.length) { console.error('Number not found'); process.exit(1); }

  const updated = await client.incomingPhoneNumbers(numbers[0].sid).update({
    voiceUrl: 'https://emlakie.com/api/calls/forward',
    voiceMethod: 'POST',
  });
  console.log('Webhook set on', updated.phoneNumber, '→', updated.voiceUrl);
}

main().catch(e => { console.error(e); process.exit(1); });
