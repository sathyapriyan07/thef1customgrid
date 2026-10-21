-- ============================================================================
-- F1 Driver Grid Builder — Migration 004: Empty Seed / Data Purge
-- ============================================================================

-- If any prior test records exist, clear them safely
TRUNCATE TABLE public.custom_lineup_seats CASCADE;
TRUNCATE TABLE public.custom_lineup_teams CASCADE;
TRUNCATE TABLE public.custom_lineups CASCADE;
TRUNCATE TABLE public.driver_team_seasons CASCADE;
TRUNCATE TABLE public.team_cars CASCADE;
TRUNCATE TABLE public.drivers CASCADE;
TRUNCATE TABLE public.teams CASCADE;
TRUNCATE TABLE public.seasons CASCADE;

-- Schema is ready and clean. Administrators can create constructors, drivers, and seasons via the Admin Dashboard.
