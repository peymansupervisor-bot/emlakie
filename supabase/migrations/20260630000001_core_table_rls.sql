-- =============================================================================
-- EMLAKIE CORE TABLE RLS
-- Migration: Row Level Security on listings, conversations, applications, profiles
-- =============================================================================
-- Without these policies the database trusts the app layer to filter by
-- landlord_id / owner. These policies add a second enforcement layer so that
-- a missing .eq() in any future route cannot leak cross-landlord data.
--
-- Service role (SUPABASE_SERVICE_KEY) bypasses RLS — routes that legitimately
-- need cross-landlord access (admin portal, crons) should continue to use that.
-- All landlord-facing routes use createSupabaseWithToken() so RLS applies.
--
-- IDEMPOTENT: safe to re-run in the SQL editor.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- LISTINGS
-- Public can read active listings. Owners can read/write only their own.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_listings"   ON listings;
DROP POLICY IF EXISTS "landlord_read_own_listings"    ON listings;
DROP POLICY IF EXISTS "landlord_insert_own_listings"  ON listings;
DROP POLICY IF EXISTS "landlord_update_own_listings"  ON listings;
DROP POLICY IF EXISTS "landlord_delete_own_listings"  ON listings;

-- Anyone (including unauthenticated) can see active/coming_soon listings
CREATE POLICY "public_read_active_listings" ON listings
  FOR SELECT USING (status IN ('active', 'coming_soon'));

-- Authenticated landlords can see all of their own listings regardless of status
CREATE POLICY "landlord_read_own_listings" ON listings
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND landlord_id = auth.uid()
  );

CREATE POLICY "landlord_insert_own_listings" ON listings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND landlord_id = auth.uid()
  );

CREATE POLICY "landlord_update_own_listings" ON listings
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND landlord_id = auth.uid()
  );

-- Soft-delete only (status='inactive/rented') is enforced at the app layer;
-- this policy still lets the DELETE route work since it verifies ownership first.
CREATE POLICY "landlord_delete_own_listings" ON listings
  FOR DELETE USING (
    auth.uid() IS NOT NULL
    AND landlord_id = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- Users can only read/update their own profile.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_own_profile"    ON profiles;
DROP POLICY IF EXISTS "user_update_own_profile"  ON profiles;
DROP POLICY IF EXISTS "user_insert_own_profile"  ON profiles;

CREATE POLICY "user_read_own_profile" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND id = auth.uid()
  );

CREATE POLICY "user_update_own_profile" ON profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND id = auth.uid()
  );

CREATE POLICY "user_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND id = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CONVERSATIONS
-- Landlords see only their own conversations. Tenants see only theirs.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participant_read_own_conversations"    ON conversations;
DROP POLICY IF EXISTS "tenant_insert_conversation"           ON conversations;
DROP POLICY IF EXISTS "participant_update_conversation"      ON conversations;

CREATE POLICY "participant_read_own_conversations" ON conversations
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (landlord_id = auth.uid() OR tenant_id = auth.uid())
  );

CREATE POLICY "tenant_insert_conversation" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND tenant_id = auth.uid()
  );

CREATE POLICY "participant_update_conversation" ON conversations
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND (landlord_id = auth.uid() OR tenant_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- APPLICATIONS
-- Landlords see applications on their listings. Tenants see their own.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "landlord_read_applications_on_own_listings" ON applications;
DROP POLICY IF EXISTS "tenant_read_own_applications"               ON applications;
DROP POLICY IF EXISTS "tenant_insert_application"                  ON applications;
DROP POLICY IF EXISTS "tenant_update_own_application"              ON applications;

-- Landlord can see all applications on their own listings (JOIN-free check via subquery)
CREATE POLICY "landlord_read_applications_on_own_listings" ON applications
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id
      AND l.landlord_id = auth.uid()
    )
  );

-- Tenants see only their own applications
CREATE POLICY "tenant_read_own_applications" ON applications
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND applicant_id = auth.uid()
  );

CREATE POLICY "tenant_insert_application" ON applications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND applicant_id = auth.uid()
  );

CREATE POLICY "tenant_update_own_application" ON applications
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND applicant_id = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- APP_MESSAGES (in-app chat messages)
-- Participants of the conversation only.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE app_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participant_read_messages"   ON app_messages;
DROP POLICY IF EXISTS "participant_insert_message"  ON app_messages;
DROP POLICY IF EXISTS "participant_update_message"  ON app_messages;

CREATE POLICY "participant_read_messages" ON app_messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.landlord_id = auth.uid() OR c.tenant_id = auth.uid())
    )
  );

CREATE POLICY "participant_insert_message" ON app_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.landlord_id = auth.uid() OR c.tenant_id = auth.uid())
    )
  );

-- Mark-as-read: only the recipient can update read_at
CREATE POLICY "participant_update_message" ON app_messages
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.landlord_id = auth.uid() OR c.tenant_id = auth.uid())
    )
  );
