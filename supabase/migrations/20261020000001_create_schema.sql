-- ============================================================================
-- F1 Driver Grid Builder — Migration 001: Core Database Schema
-- Supabase PostgreSQL Migration
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    hq TEXT,
    bio TEXT,
    primary_color TEXT DEFAULT '#E10600',
    secondary_color TEXT DEFAULT '#15151E',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team Cars Table (per season statistics)
CREATE TABLE IF NOT EXISTS public.team_cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    car_name TEXT,
    car_image_url TEXT,
    wins INTEGER DEFAULT 0 CHECK (wins >= 0),
    poles INTEGER DEFAULT 0 CHECK (poles >= 0),
    podiums INTEGER DEFAULT 0 CHECK (podiums >= 0),
    points NUMERIC DEFAULT 0 CHECK (points >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT team_year_unique UNIQUE (team_id, year)
);

-- 4. Drivers Table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL CHECK (char_length(code) = 3),
    nationality TEXT,
    bio TEXT,
    card_image_url TEXT,
    podium_image_url TEXT,
    grid_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seasons Table (supports calendar, historic, and fictional seasons)
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER,
    name TEXT NOT NULL,
    season_type TEXT DEFAULT 'formula1', -- 'formula1', 'historic', 'fictional', 'fantasy'
    is_current BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Driver-Team-Season Assignments (Historical & Current pairings)
CREATE TABLE IF NOT EXISTS public.driver_team_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL CHECK (seat_number IN (1, 2)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enforce unique driver assignment per season
    CONSTRAINT driver_season_unique UNIQUE (driver_id, season_id),
    -- Enforce unique team seat per season
    CONSTRAINT team_seat_season_unique UNIQUE (team_id, season_id, seat_number)
);

-- 7. Custom Lineups Table
CREATE TABLE IF NOT EXISTS public.custom_lineups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
    team_count INTEGER NOT NULL CHECK (team_count IN (10, 11, 12)),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Custom Lineup Teams (teams in a specific custom grid)
CREATE TABLE IF NOT EXISTS public.custom_lineup_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lineup_id UUID NOT NULL REFERENCES public.custom_lineups(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    custom_team_name TEXT,
    custom_logo_url TEXT,
    custom_primary_color TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT lineup_position_unique UNIQUE (lineup_id, position)
);

-- 9. Custom Lineup Seats (driver assignments in a custom grid)
CREATE TABLE IF NOT EXISTS public.custom_lineup_seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lineup_team_id UUID NOT NULL REFERENCES public.custom_lineup_teams(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    seat_number INTEGER NOT NULL CHECK (seat_number IN (1, 2)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT lineup_team_seat_unique UNIQUE (lineup_team_id, seat_number)
);

-- 10. Admin Roles Table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Useful Indexes
CREATE INDEX IF NOT EXISTS idx_drivers_code ON public.drivers(code);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_team_cars_team_year ON public.team_cars(team_id, year);
CREATE INDEX IF NOT EXISTS idx_driver_team_seasons_season ON public.driver_team_seasons(season_id);
CREATE INDEX IF NOT EXISTS idx_custom_lineups_created_by ON public.custom_lineups(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_lineups_visibility ON public.custom_lineups(visibility);
CREATE INDEX IF NOT EXISTS idx_custom_lineup_teams_lineup ON public.custom_lineup_teams(lineup_id);
CREATE INDEX IF NOT EXISTS idx_custom_lineup_seats_team ON public.custom_lineup_seats(lineup_team_id);
