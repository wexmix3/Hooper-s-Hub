-- ─── PHASE 3: Monetization & Saved Courts ────────────────────────────────────

-- Stripe Connect fields on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_venue_owner boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_connected boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS venue_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS venue_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS venue_email text;

-- Platform fee tracking on bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS platform_fee integer DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS stripe_transfer_id text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_amount integer DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS stripe_refund_id text;

-- Payout tracking table
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  court_id uuid REFERENCES public.courts(id),
  amount integer NOT NULL,          -- cents, owner receives this
  platform_fee integer NOT NULL,    -- cents, platform keeps this
  stripe_payout_id text,
  status text CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners see own payouts" ON public.payouts;
CREATE POLICY "Owners see own payouts"
  ON public.payouts FOR SELECT USING (auth.uid() = owner_id);

-- Saved/favorite courts
CREATE TABLE IF NOT EXISTS public.saved_courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  court_id uuid REFERENCES public.courts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, court_id)
);

ALTER TABLE public.saved_courts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own saves" ON public.saved_courts;
CREATE POLICY "Users see own saves"
  ON public.saved_courts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can save" ON public.saved_courts;
CREATE POLICY "Users can save"
  ON public.saved_courts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unsave" ON public.saved_courts;
CREATE POLICY "Users can unsave"
  ON public.saved_courts FOR DELETE USING (auth.uid() = user_id);

-- Add to realtime publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_courts;
EXCEPTION WHEN others THEN NULL; END $$;

-- Slot hold as atomic RPC (race condition protection)
DROP FUNCTION IF EXISTS public.hold_slot(uuid, uuid);
CREATE OR REPLACE FUNCTION public.hold_slot(p_slot_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.time_slots
  SET
    status = 'held',
    booked_by = p_user_id,
    held_until = now() + interval '10 minutes'
  WHERE id = p_slot_id
    AND status = 'available';
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- Cron-style cleanup: release expired holds
-- Call this via a pg_cron job or Supabase Edge Function scheduler
DROP FUNCTION IF EXISTS public.release_expired_holds();
CREATE OR REPLACE FUNCTION public.release_expired_holds()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.time_slots
  SET status = 'available', booked_by = null, held_until = null, stripe_session_id = null
  WHERE status = 'held' AND held_until < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit support ticket" ON public.support_tickets;
CREATE POLICY "Anyone can submit support ticket"
  ON public.support_tickets FOR INSERT WITH CHECK (true);
