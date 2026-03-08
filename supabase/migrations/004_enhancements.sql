-- ─── 004: Court + Run Enhancements ─────────────────────────────────────────
-- Adds columns needed for rich seed data and "coming soon" booking flow.
-- Safe to re-run (uses IF NOT EXISTS / idempotent ALTER).

-- Courts: neighborhood, booking_status, num_courts
ALTER TABLE public.courts
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'active'
    CHECK (booking_status IN ('active', 'coming_soon')),
  ADD COLUMN IF NOT EXISTS num_courts INTEGER DEFAULT 1;

-- Courts: unique constraint needed for upsert-based seeding
ALTER TABLE public.courts
  DROP CONSTRAINT IF EXISTS courts_name_borough_unique;
ALTER TABLE public.courts
  ADD CONSTRAINT courts_name_borough_unique UNIQUE (name, borough);

-- Runs: allow seeded/demo runs with no auth user (organizer_id becomes optional)
--       also store a display name for seeded runs
ALTER TABLE public.runs
  ALTER COLUMN organizer_id DROP NOT NULL;

ALTER TABLE public.runs
  ADD COLUMN IF NOT EXISTS organizer_name TEXT;
