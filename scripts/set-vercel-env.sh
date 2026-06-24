#!/bin/bash
set -e
source "$(dirname "$0")/../.env.local"

npx vercel env add TWILIO_ACCOUNT_SID production --value "$TWILIO_ACCOUNT_SID" --yes --force
npx vercel env add TWILIO_AUTH_TOKEN production --value "$TWILIO_AUTH_TOKEN" --yes --force
npx vercel env add TWILIO_PHONE_NUMBER production --value "$TWILIO_PHONE_NUMBER" --yes --force

echo "All Twilio env vars set on Vercel."
