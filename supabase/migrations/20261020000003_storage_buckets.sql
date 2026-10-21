-- ============================================================================
-- F1 Driver Grid Builder — Migration 003: Supabase Storage Buckets
-- ============================================================================

-- Create storage buckets for media
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('team-logos', 'team-logos', true),
    ('driver-images', 'driver-images', true),
    ('car-images', 'car-images', true),
    ('lineup-posters', 'lineup-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for all buckets
CREATE POLICY "Public Read Access for F1 Assets"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('team-logos', 'driver-images', 'car-images', 'lineup-posters'));

-- Admin upload/update/delete for media buckets
CREATE POLICY "Admin Upload Access for Team Logos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        (bucket_id IN ('team-logos', 'driver-images', 'car-images') AND public.is_admin())
        OR
        (bucket_id = 'lineup-posters' AND auth.role() = 'authenticated')
    );

CREATE POLICY "Admin Modify Access for Assets"
    ON storage.objects FOR UPDATE
    USING (public.is_admin() OR bucket_id = 'lineup-posters');

CREATE POLICY "Admin Delete Access for Assets"
    ON storage.objects FOR DELETE
    USING (public.is_admin() OR bucket_id = 'lineup-posters');
