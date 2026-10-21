-- ============================================================================
-- F1 Driver Grid Builder — Migration 002: Security, RLS & Functions
-- ============================================================================

-- Function to check if the current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_team_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_lineup_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_lineup_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 1. Teams: Public can view, Admin can insert/update/delete
CREATE POLICY "Public teams are readable by everyone"
    ON public.teams FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to teams"
    ON public.teams FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. Team Cars: Public can view, Admin can insert/update/delete
CREATE POLICY "Public team cars are readable by everyone"
    ON public.team_cars FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to team cars"
    ON public.team_cars FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. Drivers: Public can view, Admin can insert/update/delete
CREATE POLICY "Public drivers are readable by everyone"
    ON public.drivers FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to drivers"
    ON public.drivers FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Seasons: Public can view published seasons, Admin can view all and mutate
CREATE POLICY "Public seasons are readable if published or admin"
    ON public.seasons FOR SELECT
    USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins have full access to seasons"
    ON public.seasons FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Driver Team Seasons: Public can view, Admin can insert/update/delete
CREATE POLICY "Public assignments readable by everyone"
    ON public.driver_team_seasons FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to driver team seasons"
    ON public.driver_team_seasons FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Custom Lineups:
-- Anyone can view public lineups; owner can view their own private lineups; admins can view all
CREATE POLICY "Anyone can view public lineups"
    ON public.custom_lineups FOR SELECT
    USING (visibility = 'public' OR auth.uid() = created_by OR public.is_admin());

-- Authenticated users or anonymous callers can insert lineups
CREATE POLICY "Users can create lineups"
    ON public.custom_lineups FOR INSERT
    WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

-- Users can update their own lineups, or admins can update any
CREATE POLICY "Users can update their own lineups"
    ON public.custom_lineups FOR UPDATE
    USING (auth.uid() = created_by OR public.is_admin())
    WITH CHECK (auth.uid() = created_by OR public.is_admin());

-- Users can delete their own lineups, or admins can delete any
CREATE POLICY "Users can delete their own lineups"
    ON public.custom_lineups FOR DELETE
    USING (auth.uid() = created_by OR public.is_admin());

-- 7. Custom Lineup Teams & Seats
CREATE POLICY "Lineup teams readable if lineup readable"
    ON public.custom_lineup_teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_lineups l
            WHERE l.id = custom_lineup_teams.lineup_id
            AND (l.visibility = 'public' OR l.created_by = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Lineup teams mutable by lineup owner or admin"
    ON public.custom_lineup_teams FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_lineups l
            WHERE l.id = custom_lineup_teams.lineup_id
            AND (l.created_by = auth.uid() OR l.created_by IS NULL OR public.is_admin())
        )
    );

CREATE POLICY "Lineup seats readable if parent team readable"
    ON public.custom_lineup_seats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_lineup_teams lt
            JOIN public.custom_lineups l ON l.id = lt.lineup_id
            WHERE lt.id = custom_lineup_seats.lineup_team_id
            AND (l.visibility = 'public' OR l.created_by = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Lineup seats mutable by lineup owner or admin"
    ON public.custom_lineup_seats FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_lineup_teams lt
            JOIN public.custom_lineups l ON l.id = lt.lineup_id
            WHERE lt.id = custom_lineup_seats.lineup_team_id
            AND (l.created_by = auth.uid() OR l.created_by IS NULL OR public.is_admin())
        )
    );

-- 8. Admin Roles: Only readable by self and superadmin
CREATE POLICY "Admins can view their own role"
    ON public.admin_roles FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());
