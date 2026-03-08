-- ─── 005: Profile Enhancements ────────────────────────────────────────────────
-- Adds player identity, preferences, and stats columns to profiles.
-- Safe to re-run (uses IF NOT EXISTS).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS position TEXT
    CHECK (position IN ('point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center', 'any')),
  ADD COLUMN IF NOT EXISTS play_style TEXT
    CHECK (play_style IN ('competitive', 'casual', 'both')),
  ADD COLUMN IF NOT EXISTS preferred_court_type TEXT
    CHECK (preferred_court_type IN ('indoor', 'outdoor', 'both')),
  ADD COLUMN IF NOT EXISTS preferred_time TEXT
    CHECK (preferred_time IN ('early_morning', 'morning', 'afternoon', 'evening', 'night', 'any')),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS runs_joined INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS runs_organized INTEGER DEFAULT 0;

-- Mark existing users who completed onboarding (had borough set) as completed
UPDATE public.profiles
  SET onboarding_completed = true
  WHERE borough IS NOT NULL AND onboarding_completed = false;
