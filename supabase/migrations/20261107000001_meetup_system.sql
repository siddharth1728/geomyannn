-- ====================================================================
-- GEORYNTH PHASE 2: GROUP MEETUP & DISCOVERY SYSTEM MIGRATION
-- Schema: meetups, meetup_members, meetup_locations, meetup_venues, meetup_votes
-- ====================================================================

-- 1. MEETUPS TABLE
CREATE TABLE IF NOT EXISTS public.meetups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3 AND char_length(title) <= 120),
  category TEXT NOT NULL CHECK (category IN (
    'restaurant',
    'cafe',
    'cinema',
    'park',
    'shopping',
    'entertainment',
    'sports',
    'activity',
    'other'
  )),
  description TEXT,
  planned_at TIMESTAMPTZ NOT NULL,
  budget TEXT CHECK (budget IN ('budget', 'moderate', 'premium', 'any')),
  transport_mode TEXT NOT NULL DEFAULT 'car' CHECK (transport_mode IN ('car', 'bike', 'foot')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'voting', 'confirmed', 'completed', 'cancelled')),
  confirmed_venue_id TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days')
);

ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_meetups_invite_code ON public.meetups(invite_code);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON public.meetups(status);

-- Policies for meetups
CREATE POLICY "Public read meetups by invite code or active"
  ON public.meetups
  FOR SELECT
  TO public
  USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can create a meetup"
  ON public.meetups
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Creator can update meetup"
  ON public.meetups
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- 2. MEETUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.meetup_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(meetup_id, user_id)
);

ALTER TABLE public.meetup_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_meetup_members_lookup ON public.meetup_members(meetup_id, user_id);

CREATE POLICY "Members read access"
  ON public.meetup_members
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can join meetup"
  ON public.meetup_members
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Member can leave"
  ON public.meetup_members
  FOR DELETE
  TO public
  USING (true);

-- 3. MEETUP LOCATIONS TABLE (Short-lived, revocable)
CREATE TABLE IF NOT EXISTS public.meetup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  label TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
  is_approximate BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '24 hours'),
  UNIQUE(meetup_id, member_id)
);

ALTER TABLE public.meetup_locations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_meetup_locations_meetup ON public.meetup_locations(meetup_id);

CREATE POLICY "Locations read for meetup members"
  ON public.meetup_locations
  FOR SELECT
  TO public
  USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Members can upsert location"
  ON public.meetup_locations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Members can update location"
  ON public.meetup_locations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Members can revoke location"
  ON public.meetup_locations
  FOR DELETE
  TO public
  USING (true);

-- 4. MEETUP CANDIDATE VENUES TABLE
CREATE TABLE IF NOT EXISTS public.meetup_venues (
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
  image_url TEXT,
  avg_duration_sec INTEGER NOT NULL,
  max_duration_sec INTEGER NOT NULL,
  min_duration_sec INTEGER NOT NULL,
  disparity_sec INTEGER NOT NULL,
  participant_times JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.meetup_venues ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_meetup_venues_lookup ON public.meetup_venues(meetup_id);

CREATE POLICY "Venues read access"
  ON public.meetup_venues
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Insert meetup venues"
  ON public.meetup_venues
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 5. MEETUP VOTES TABLE (1 active vote per participant per meetup)
CREATE TABLE IF NOT EXISTS public.meetup_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(meetup_id, member_id)
);

ALTER TABLE public.meetup_votes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_meetup_votes_meetup ON public.meetup_votes(meetup_id);

CREATE POLICY "Votes read access"
  ON public.meetup_votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Cast vote"
  ON public.meetup_votes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Change vote"
  ON public.meetup_votes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Retract vote"
  ON public.meetup_votes
  FOR DELETE
  TO public
  USING (true);
