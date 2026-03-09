-- ─── 007: Waitlist ───────────────────────────────────────────────────────────
-- Email capture for coming-soon features (booking, crowd reports, etc.)

CREATE TABLE IF NOT EXISTS public.waitlist (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL,
  feature     TEXT        NOT NULL,  -- 'booking', 'crowd_reports', 'mobile_app'
  court_id    UUID        REFERENCES public.courts(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, feature)
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);
