export interface Team {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  hq: string;
  bio: string;
  primary_color: string;
  secondary_color: string;
  created_at?: string;
  updated_at?: string;
}

export interface Driver {
  id: string;
  name: string;
  code: string;
  nationality: string;
  bio: string;
  card_image_url: string;
  podium_image_url?: string;
  grid_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamCar {
  id: string;
  team_id: string;
  year: number;
  car_name: string;
  car_image_url?: string;
  wins: number;
  poles: number;
  podiums: number;
  points: number;
  created_at?: string;
  updated_at?: string;
  // Joined field
  team?: Team;
}

export interface Season {
  id: string;
  year?: number;
  name: string;
  season_type: 'formula1' | 'historic' | 'fictional' | 'fantasy';
  is_current: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DriverTeamSeason {
  id: string;
  driver_id: string;
  team_id: string;
  season_id: string;
  seat_number: 1 | 2;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  driver?: Driver;
  team?: Team;
  season?: Season;
}

export interface CustomLineupSeat {
  id?: string;
  seat_number: 1 | 2;
  driver_id: string | null;
  driver?: Driver | null;
}

export interface CustomLineupTeam {
  id?: string;
  position: number;
  team_id: string | null; // null if custom fictional team
  custom_team_name?: string;
  custom_logo_url?: string;
  custom_primary_color?: string;
  team?: Team | null;
  seats: CustomLineupSeat[];
}

export interface CustomLineup {
  id: string;
  created_by?: string | null;
  name: string;
  season_id?: string | null;
  team_count: 10 | 11 | 12;
  status: 'draft' | 'complete';
  visibility: 'public' | 'private' | 'unlisted';
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  teams: CustomLineupTeam[];
}

export interface AdminRole {
  user_id: string;
  role: 'admin' | 'superadmin';
  created_at?: string;
}

export interface PosterPreset {
  id: string;
  name: string;
  description: string;
  background: 'dark' | 'carbon' | 'light' | 'clean';
  accentTheme: 'team' | 'red' | 'gold' | 'monochrome';
  layoutDensity: 'compact' | 'editorial' | 'championship';
}
