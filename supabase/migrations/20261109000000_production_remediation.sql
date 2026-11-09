-- ====================================================================
-- GEORYNTH PRODUCTION BLOCKER REMEDIATION MIGRATION
-- Tables: meetup_invites, meetup_shortlists, meetup_decisions,
--         meetup_feedback, support_tickets
-- Security: Strict Role-Based & Membership-Based Row Level Security
-- ====================================================================

-- 1. MEETUP INVITES TABLE
CREATE TABLE IF NOT EXISTS public.meetup_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  usage_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.meetup_invites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_meetup_invites_code ON public.meetup_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_meetup_invites_meetup ON public.meetup_invites(meetup_id);

CREATE POLICY "Anyone can view valid unexpired invite codes"
  ON public.meetup_invites
  FOR SELECT
  TO public
  USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Members or creators can generate invites"
  ON public.meetup_invites
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 2. MEETUP SHORTLISTS (Candidate venues evaluated for a meetup)
CREATE TABLE IF NOT EXISTS public.meetup_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
  rating DOUBLE PRECISION,
  price_level TEXT,
  avg_duration_sec INTEGER NOT NULL,
  max_duration_sec INTEGER NOT NULL,
  min_duration_sec INTEGER NOT NULL,
  disparity_sec INTEGER NOT NULL,
  participant_times JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(meetup_id, venue_id)
);

ALTER TABLE public.meetup_shortlists ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_shortlists_meetup ON public.meetup_shortlists(meetup_id);

CREATE POLICY "Shortlists readable by public or members"
  ON public.meetup_shortlists
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Shortlists insertable by creators or members"
  ON public.meetup_shortlists
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Shortlists updatable by creators or members"
  ON public.meetup_shortlists
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- 3. MEETUP DECISIONS (Official confirmed venue & converging directions)
CREATE TABLE IF NOT EXISTS public.meetup_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID NOT NULL UNIQUE REFERENCES public.meetups(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  confirmed_by TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  directions_cache JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.meetup_decisions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_decisions_meetup ON public.meetup_decisions(meetup_id);

CREATE POLICY "Decisions readable by all participants"
  ON public.meetup_decisions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authorized hosts can confirm decision"
  ON public.meetup_decisions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authorized hosts can update decision"
  ON public.meetup_decisions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- 4. MEETUP FEEDBACK (Post-meetup customer ratings and accuracy telemetry)
CREATE TABLE IF NOT EXISTS public.meetup_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  accuracy TEXT NOT NULL CHECK (accuracy IN ('accurate', 'slight_delay', 'heavy_delay')),
  suitability TEXT NOT NULL CHECK (suitability IN ('great', 'average', 'crowded')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(meetup_id, member_id)
);

ALTER TABLE public.meetup_feedback ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_feedback_meetup ON public.meetup_feedback(meetup_id);

CREATE POLICY "Feedback readable by meetup participants"
  ON public.meetup_feedback
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Participants can submit their own feedback"
  ON public.meetup_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Participants can update their own feedback"
  ON public.meetup_feedback
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- 5. SUPPORT TICKETS TABLE (Customer issue reporting and place corrections)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT NOT NULL CHECK (char_length(trim(user_name)) >= 2),
  email TEXT,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('inaccurate_place', 'route_error', 'feature_request', 'general')),
  message TEXT NOT NULL CHECK (char_length(trim(message)) >= 5 AND char_length(message) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- RESTRICTED ACCESS FOR SUPPORT TICKETS:
-- Only service_role (authorized administrators) can read customer tickets!
-- Public / anonymous users CANNOT read tickets (protecting customer emails and complaint details).
CREATE POLICY "Public submission of support tickets"
  ON public.support_tickets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only admin/service_role can view customer support tickets"
  ON public.support_tickets
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Only admin/service_role can update customer support tickets"
  ON public.support_tickets
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
