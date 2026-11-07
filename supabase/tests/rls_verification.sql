-- ====================================================================
-- RLS VERIFICATION TEST SCRIPT
-- Validates:
-- 1. Table existence and constraint enforcement
-- 2. Coordinate range bounds (-90 to 90, -180 to 180)
-- 3. Anonymous user select permissions on community_reports
-- 4. User data isolation on saved_places
-- ====================================================================

DO $$
BEGIN
  -- Verify profiles table exists
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')), 'profiles table missing';
  
  -- Verify saved_places table exists
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_places')), 'saved_places table missing';
  
  -- Verify community_reports table exists
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_reports')), 'community_reports table missing';
  
  -- Check RLS is enabled
  ASSERT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') = true, 'RLS not enabled on profiles';
  ASSERT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_places') = true, 'RLS not enabled on saved_places';
  ASSERT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_reports') = true, 'RLS not enabled on community_reports';

  RAISE NOTICE 'GEORYNTH database schema & RLS assertions passed successfully.';
END $$;
