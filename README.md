# F1 Driver Grid Builder

A Formula 1 fan platform to create custom starting grids, assign drivers to constructors across 10, 11, or 12 team formats, explore historic and alternate seasons, and render downloadable high-resolution paddock posters.

---

## 🏎️ Key Features

- **Interactive Grid Builder**:
  - Support for 10, 11, and 12 constructor grid layouts (20, 22, or 24 cockpits).
  - Searchable driver picker modal with nationality filters and team affiliations.
  - Real-time duplicate driver validation preventing identical drivers in multiple cockpits.
  - Custom / fictional constructor builder with custom team names, brand colors, and logos (e.g. Andretti Cadillac, Porsche Penske, Audi Sport, Prema).
  - Quick action presets: Auto-fill Confirmed 2025 Grid, Randomize Grid, Clear Seats.
- **High-Resolution Poster Studio**:
  - Renders ultra-DPI posters suitable for print and social sharing via HTML5 Canvas.
  - Presets: Official Grid Style, Dark Paddock, Minimal Lineup, Championship Poster.
  - Formats: 1080×1350 (Portrait), 1920×1080 (Wallpaper), 1400×1980 (Print A3).
  - Genuine PNG downloads with custom headline, subtitle, creator credit, and branding toggles.
- **Paddock Archives**:
  - Searchable, filterable Driver Directory with biographical stats, driver cards, and career team records.
  - Constructor Directory with team colors, headquarters, car chassis history, and wins/poles/podiums.
  - Historical & Fantasy Seasons browser (2025 Current, 2024, 2021 Title Decider, 2026 Regulations).
- **Password-Protected FIA Admin Dashboard (`/admin`)**:
  - Database-driven Overview metrics with real counts.
  - Full CRUD operations for Teams, Drivers, Team Cars, Seasons, and Driver-Team Seat Assignments.
  - Media Library for managing constructor logos and driver portraits.
  - Lineup moderation and featuring on the homepage.
  - JSON Database Backup & Restore.

---

## 🛠️ Architecture & Supabase Integration

The application supports both **Live Supabase PostgreSQL** and **Local Reactive Paddock Storage**:
- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are provided, all operations sync directly with your Supabase backend.
- If credentials are not yet configured, the app operates seamlessly in reactive local browser storage with full CRUD and export capabilities.

### Supabase Migrations (`/supabase/migrations/`)
1. `20261020000001_create_schema.sql` — Core database tables (`teams`, `team_cars`, `drivers`, `seasons`, `driver_team_seasons`, `custom_lineups`, `custom_lineup_teams`, `custom_lineup_seats`, `admin_roles`).
2. `20261020000002_rls_and_functions.sql` — PostgreSQL Row Level Security (RLS) policies and `is_admin()` function.
3. `20261020000003_storage_buckets.sql` — Storage buckets (`team-logos`, `driver-images`, `car-images`, `lineup-posters`).
4. `20261020000004_seed_data.sql` — Rich seed dataset of Formula 1 constructors, drivers, cars, and confirmed pairings.

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-publishable-key"
```

### 2. Apply Database Migrations in Supabase
Run the SQL migration scripts in order in your Supabase SQL Editor:
- `20261020000001_create_schema.sql`
- `20261020000002_rls_and_functions.sql`
- `20261020000003_storage_buckets.sql`
- `20261020000004_seed_data.sql`

### 3. Provisioning the First Administrator
In Supabase:
1. Sign up an admin user through Supabase Auth (e.g. `admin@f1gridbuilder.com`).
2. Grant the admin role in the SQL Editor:
```sql
INSERT INTO public.admin_roles (user_id, role)
VALUES ('<user-uuid-from-auth.users>', 'superadmin');
```
*Note: In evaluation mode, click the "1-Click Test Admin Sign-In" on `/admin/login` or use `admin@f1gridbuilder.com` with password `admin123456`.*

---

## 🧪 Testing

Automated verification tests are located in `src/tests/gridBuilder.test.ts`.
They verify:
- Three-letter uppercase driver code enforcement (`VER`, `HAM`, `NOR`).
- Driver code database uniqueness.
- Constructor slug uniqueness.
- 10, 11, and 12 team cockpit seat math (20, 22, 24 seats).
- Real-time duplicate driver detection and conflict warning.
- Season seat allocation integrity.
