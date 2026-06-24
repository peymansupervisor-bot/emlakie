import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

async function main() {
  console.log('Checking available numbers (no purchase)...');
  const available = await client.availablePhoneNumbers('US').local.list({ limit: 3 });
  console.log('Available:', available.map(n => n.phoneNumber));

  console.log('\nChecking existing purchased numbers...');
  const owned = await client.incomingPhoneNumbers.list();
  console.log('Owned:', owned.map(n => ({ number: n.phoneNumber, sid: n.sid, voiceUrl: n.voiceUrl })));

  console.log('\nAccount info...');
  const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();
  console.log('Status:', account.status, 'Type:', account.type);
}

main().catch(e => { console.error('ERROR:', e.message, e.code, e.status); });
