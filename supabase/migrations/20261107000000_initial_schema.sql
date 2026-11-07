-- ====================================================================
-- GEORYNTH DATABASE INITIAL MIGRATION
-- Schema: profiles, saved_places, community_reports
-- Security: Row Level Security (RLS) with explicit user policies
-- ====================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. SAVED PLACES TABLE
CREATE TABLE IF NOT EXISTS public.saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (char_length(trim(label)) > 0 AND char_length(label) <= 100),
  place_name TEXT NOT NULL CHECK (char_length(trim(place_name)) > 0),
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

-- Indexes for saved_places
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON public.saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_created_at ON public.saved_places(created_at DESC);

-- Saved Places RLS Policies: Strictly User Owned
CREATE POLICY "Users can view own saved places"
  ON public.saved_places
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved places"
  ON public.saved_places
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved places"
  ON public.saved_places
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved places"
  ON public.saved_places
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. COMMUNITY REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'pothole',
    'waterlogging',
    'road_closure',
    'traffic_disruption',
    'broken_streetlight',
    'blocked_footpath',
    'other'
  )),
  description TEXT NOT NULL CHECK (char_length(trim(description)) >= 5 AND char_length(description) <= 1000),
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'verified', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '30 days')
);

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- Indexes for community reports query performance
CREATE INDEX IF NOT EXISTS idx_community_reports_category ON public.community_reports(category);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON public.community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_expires_at ON public.community_reports(expires_at);
CREATE INDEX IF NOT EXISTS idx_community_reports_coords ON public.community_reports(latitude, longitude);

-- Community Reports RLS Policies:
-- 1) Any user (including anonymous) can view active unexpired community reports
CREATE POLICY "Public read access to active non-expired reports"
  ON public.community_reports
  FOR SELECT
  TO public
  USING (expires_at > timezone('utc'::text, now()) AND status != 'dismissed');

-- 2) Authenticated users can insert reports with initial status 'reported'
CREATE POLICY "Authenticated users can submit reports"
  ON public.community_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND 
    status = 'reported'
  );

-- 3) Reporters can update description or delete their own report if still in 'reported' status
CREATE POLICY "Reporters can update own unverified report description"
  ON public.community_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by AND status = 'reported')
  WITH CHECK (auth.uid() = created_by AND status = 'reported');

CREATE POLICY "Reporters can delete own report"
  ON public.community_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
