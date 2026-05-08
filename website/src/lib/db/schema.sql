-- Run this once in the Vercel dashboard: Storage → your database → Query tab.
-- For an existing deployment, the migration block below brings the legacy
-- schema (no share_id, NOT NULL clerk_user_id) up to date.

CREATE TABLE IF NOT EXISTS agons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  -- NULL when an anonymous (signed-out) user saved this agon. Authenticated
  -- saves still set the Clerk user id so /library can scope by owner.
  clerk_user_id TEXT,
  -- Short, URL-safe public handle used in /agora/a/<share_id>. Generated
  -- server-side via lib/share-id.ts; UNIQUE so a public lookup is guaranteed
  -- to resolve to one record. Nullable for legacy rows; backfilled by
  -- migration below.
  share_id TEXT UNIQUE,
  topic TEXT NOT NULL,
  mind_slugs TEXT[] NOT NULL,
  rounds INTEGER NOT NULL DEFAULT 3,
  turns JSONB NOT NULL DEFAULT '[]',
  consensus JSONB,
  research TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agons_user ON agons(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_agons_created ON agons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agons_share_id ON agons(share_id);

-- ============================================================================
-- Migration: bring an existing deployment up to date.
-- Safe to run repeatedly; each statement is gated on whether the change
-- already exists. Run from the Vercel Postgres Query tab.
-- ============================================================================

-- 1. Allow anonymous saves: clerk_user_id may be NULL.
ALTER TABLE agons ALTER COLUMN clerk_user_id DROP NOT NULL;

-- 2. Add the share_id column if it does not yet exist.
ALTER TABLE agons ADD COLUMN IF NOT EXISTS share_id TEXT;

-- 3. Backfill share_id for rows that pre-date this column. We use the existing
--    primary key id (a UUID) to derive a deterministic short slug — readable
--    enough for legacy rows, but for new rows the API generates a fresh,
--    purpose-built share_id via lib/share-id.ts.
UPDATE agons
   SET share_id = substr(replace(id::text, '-', ''), 1, 10)
 WHERE share_id IS NULL;

-- 4. Enforce uniqueness once backfill is complete.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agons_share_id_key'
  ) THEN
    ALTER TABLE agons ADD CONSTRAINT agons_share_id_key UNIQUE (share_id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_agons_share_id ON agons(share_id);
