-- EMLAKIE UPDATE / NEWS: per-landlord unsubscribe token + opt-out timestamp.
alter table profiles
  add column if not exists news_unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists news_unsubscribed_at timestamptz;

create unique index if not exists profiles_news_unsubscribe_token_key
  on profiles (news_unsubscribe_token);
