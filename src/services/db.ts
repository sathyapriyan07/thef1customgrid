import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Team, 
  Driver, 
  TeamCar, 
  Season, 
  DriverTeamSeason, 
  CustomLineup, 
  CustomLineupTeam, 
  CustomLineupSeat 
} from '../types';

// Local storage keys
const STORAGE_KEYS = {
  TEAMS: 'f1_grid_teams',
  DRIVERS: 'f1_grid_drivers',
  CARS: 'f1_grid_cars',
  SEASONS: 'f1_grid_seasons',
  ASSIGNMENTS: 'f1_grid_assignments',
  LINEUPS: 'f1_grid_lineups',
  MEDIA: 'f1_grid_media_library',
};

// Safe LocalStorage helpers
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Purge any previously stored seed data so the application starts with a completely clean slate
export function initializeLocalStore() {
  const PURGE_KEY = 'f1_grid_seed_cleared_v4';
  if (!localStorage.getItem(PURGE_KEY)) {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LINEUPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify([]));
    localStorage.removeItem('f1_grid_saved_draft');
    localStorage.setItem(PURGE_KEY, 'true');
  }

  getLocalItem(STORAGE_KEYS.TEAMS, []);
  getLocalItem(STORAGE_KEYS.DRIVERS, []);
  getLocalItem(STORAGE_KEYS.CARS, []);
  getLocalItem(STORAGE_KEYS.SEASONS, []);
  getLocalItem(STORAGE_KEYS.ASSIGNMENTS, []);
  getLocalItem(STORAGE_KEYS.LINEUPS, []);
}

initializeLocalStore();

export function clearAllData(): void {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LINEUPS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify([]));
  localStorage.removeItem('f1_grid_saved_draft');
}

// Backwards-compatible alias
export function resetToDefaultSeed(): void {
  clearAllData();
}

// ==========================================
// TEAMS SERVICE
// ==========================================
export async function getTeams(): Promise<Team[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('teams').select('*').order('name');
      if (!error && data) return data as Team[];
    } catch (err) {
      console.warn('Supabase getTeams error, falling back to local store:', err);
    }
  }
  return getLocalItem<Team[]>(STORAGE_KEYS.TEAMS, []);
}

export async function getTeamById(id: string): Promise<Team | null> {
  const teams = await getTeams();
  return teams.find(t => t.id === id || t.slug === id) || null;
}

export async function createTeam(teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team> {
  const newTeam: Team = {
    ...teamData,
    id: 't-' + (teamData.slug || Date.now().toString()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('teams').insert([newTeam]).select().single();
      if (!error && data) return data as Team;
    } catch (err) {
      console.warn('Supabase createTeam error, persisting locally:', err);
    }
  }

  const teams = getLocalItem<Team[]>(STORAGE_KEYS.TEAMS, []);
  teams.push(newTeam);
  setLocalItem(STORAGE_KEYS.TEAMS, teams);
  return newTeam;
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Team;
    } catch (err) {
      console.warn('Supabase updateTeam error, updating locally:', err);
    }
  }

  const teams = getLocalItem<Team[]>(STORAGE_KEYS.TEAMS, []);
  const index = teams.findIndex(t => t.id === id);
  if (index === -1) return null;
  teams[index] = { ...teams[index], ...updates, updated_at: new Date().toISOString() };
  setLocalItem(STORAGE_KEYS.TEAMS, teams);
  return teams[index];
}

export async function deleteTeam(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteTeam error:', err);
    }
  }

  const teams = getLocalItem<Team[]>(STORAGE_KEYS.TEAMS, []);
  const filtered = teams.filter(t => t.id !== id);
  setLocalItem(STORAGE_KEYS.TEAMS, filtered);
  return true;
}

// ==========================================
// DRIVERS SERVICE
// ==========================================
export async function getDrivers(filters?: { nationality?: string; search?: string }): Promise<Driver[]> {
  let list: Driver[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('drivers').select('*').order('name');
      if (!error && data) list = data as Driver[];
    } catch (err) {
      console.warn('Supabase getDrivers error:', err);
    }
  } else {
    list = getLocalItem<Driver[]>(STORAGE_KEYS.DRIVERS, []);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
  }
  if (filters?.nationality && filters.nationality !== 'all') {
    list = list.filter(d => d.nationality.toLowerCase() === filters.nationality?.toLowerCase());
  }

  return list;
}

export async function getDriverById(id: string): Promise<Driver | null> {
  const drivers = await getDrivers();
  return drivers.find(d => d.id === id || d.code === id) || null;
}

export async function createDriver(driverData: Omit<Driver, 'id' | 'created_at' | 'updated_at'>): Promise<Driver> {
  const newDriver: Driver = {
    ...driverData,
    id: 'd-' + (driverData.code.toLowerCase() || Date.now().toString()),
    code: driverData.code.toUpperCase().trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('drivers').insert([newDriver]).select().single();
      if (!error && data) return data as Driver;
    } catch (err) {
      console.warn('Supabase createDriver error:', err);
    }
  }

  const drivers = getLocalItem<Driver[]>(STORAGE_KEYS.DRIVERS, []);
  drivers.push(newDriver);
  setLocalItem(STORAGE_KEYS.DRIVERS, drivers);
  return newDriver;
}

export async function updateDriver(id: string, updates: Partial<Driver>): Promise<Driver | null> {
  if (updates.code) {
    updates.code = updates.code.toUpperCase().trim();
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Driver;
    } catch (err) {
      console.warn('Supabase updateDriver error:', err);
    }
  }

  const drivers = getLocalItem<Driver[]>(STORAGE_KEYS.DRIVERS, []);
  const index = drivers.findIndex(d => d.id === id);
  if (index === -1) return null;
  drivers[index] = { ...drivers[index], ...updates, updated_at: new Date().toISOString() };
  setLocalItem(STORAGE_KEYS.DRIVERS, drivers);
  return drivers[index];
}

export async function deleteDriver(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteDriver error:', err);
    }
  }

  const drivers = getLocalItem<Driver[]>(STORAGE_KEYS.DRIVERS, []);
  const filtered = drivers.filter(d => d.id !== id);
  setLocalItem(STORAGE_KEYS.DRIVERS, filtered);
  return true;
}

// ==========================================
// TEAM CARS SERVICE
// ==========================================
export async function getTeamCars(teamId?: string, year?: number): Promise<TeamCar[]> {
  let cars: TeamCar[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('team_cars').select('*, team:teams(*)');
      if (teamId) query = query.eq('team_id', teamId);
      if (year) query = query.eq('year', year);
      const { data, error } = await query;
      if (!error && data) cars = data as TeamCar[];
    } catch (err) {
      console.warn('Supabase getTeamCars error:', err);
    }
  } else {
    cars = getLocalItem<TeamCar[]>(STORAGE_KEYS.CARS, []);
    const teams = getLocalItem<Team[]>(STORAGE_KEYS.TEAMS, []);
    cars = cars.map(c => ({
      ...c,
      team: teams.find(t => t.id === c.team_id),
    }));
    if (teamId) cars = cars.filter(c => c.team_id === teamId);
    if (year) cars = cars.filter(c => c.year === year);
  }

  return cars;
}

export async function createTeamCar(carData: Omit<TeamCar, 'id' | 'created_at' | 'updated_at'>): Promise<TeamCar> {
  const newCar: TeamCar = {
    ...carData,
    id: 'c-' + Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('team_cars').insert([newCar]).select().single();
      if (!error && data) return data as TeamCar;
    } catch (err) {
      console.warn('Supabase createTeamCar error:', err);
    }
  }

  const cars = getLocalItem<TeamCar[]>(STORAGE_KEYS.CARS, []);
  cars.push(newCar);
  setLocalItem(STORAGE_KEYS.CARS, cars);
  return newCar;
}

export async function updateTeamCar(id: string, updates: Partial<TeamCar>): Promise<TeamCar | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('team_cars')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as TeamCar;
    } catch (err) {
      console.warn('Supabase updateTeamCar error:', err);
    }
  }

  const cars = getLocalItem<TeamCar[]>(STORAGE_KEYS.CARS, []);
  const index = cars.findIndex(c => c.id === id);
  if (index === -1) return null;
  cars[index] = { ...cars[index], ...updates, updated_at: new Date().toISOString() };
  setLocalItem(STORAGE_KEYS.CARS, cars);
  return cars[index];
}

export async function deleteTeamCar(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('team_cars').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteTeamCar error:', err);
    }
  }

  const cars = getLocalItem<TeamCar[]>(STORAGE_KEYS.CARS, []);
  setLocalItem(STORAGE_KEYS.CARS, cars.filter(c => c.id !== id));
  return true;
}

// ==========================================
// SEASONS SERVICE
// ==========================================
export async function getSeasons(): Promise<Season[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('seasons').select('*').order('year', { ascending: false });
      if (!error && data) return data as Season[];
    } catch (err) {
      console.warn('Supabase getSeasons error:', err);
    }
  }
  return getLocalItem<Season[]>(STORAGE_KEYS.SEASONS, []);
}

export async function getSeasonById(id: string): Promise<Season | null> {
  const seasons = await getSeasons();
  return seasons.find(s => s.id === id || s.year?.toString() === id) || null;
}

export async function createSeason(seasonData: Omit<Season, 'id' | 'created_at' | 'updated_at'>): Promise<Season> {
  const newSeason: Season = {
    ...seasonData,
    id: 's-' + (seasonData.year ? seasonData.year.toString() : Date.now().toString()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('seasons').insert([newSeason]).select().single();
      if (!error && data) return data as Season;
    } catch (err) {
      console.warn('Supabase createSeason error:', err);
    }
  }

  const seasons = getLocalItem<Season[]>(STORAGE_KEYS.SEASONS, []);
  seasons.push(newSeason);
  setLocalItem(STORAGE_KEYS.SEASONS, seasons);
  return newSeason;
}

export async function updateSeason(id: string, updates: Partial<Season>): Promise<Season | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Season;
    } catch (err) {
      console.warn('Supabase updateSeason error:', err);
    }
  }

  const seasons = getLocalItem<Season[]>(STORAGE_KEYS.SEASONS, []);
  const index = seasons.findIndex(s => s.id === id);
  if (index === -1) return null;
  seasons[index] = { ...seasons[index], ...updates, updated_at: new Date().toISOString() };
  setLocalItem(STORAGE_KEYS.SEASONS, seasons);
  return seasons[index];
}

export async function deleteSeason(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('seasons').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteSeason error:', err);
    }
  }

  const seasons = getLocalItem<Season[]>(STORAGE_KEYS.SEASONS, []);
  setLocalItem(STORAGE_KEYS.SEASONS, seasons.filter(s => s.id !== id));
  return true;
}

// ==========================================
// DRIVER-TEAM SEASONS (ASSIGNMENTS) SERVICE
// ==========================================
export async function getDriverTeamSeasons(seasonId?: string): Promise<DriverTeamSeason[]> {
  let list: DriverTeamSeason[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('driver_team_seasons').select('*, driver:drivers(*), team:teams(*), season:seasons(*)');
      if (seasonId) query = query.eq('season_id', seasonId);
      const { data, error } = await query;
      if (!error && data) list = data as DriverTeamSeason[];
    } catch (err) {
      console.warn('Supabase getDriverTeamSeasons error:', err);
    }
  } else {
    list = getLocalItem<DriverTeamSeason[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    const drivers = getLocalItem<Driver[]>(STORAGE_KEYS.DRIVERS, []);
    const teams = getLocalItem<Team[]>(STORAGE_KEYS.TEAMS, []);
    const seasons = getLocalItem<Season[]>(STORAGE_KEYS.SEASONS, []);

    list = list.map(a => ({
      ...a,
      driver: drivers.find(d => d.id === a.driver_id),
      team: teams.find(t => t.id === a.team_id),
      season: seasons.find(s => s.id === a.season_id),
    }));

    if (seasonId) list = list.filter(a => a.season_id === seasonId);
  }

  return list;
}

export async function createDriverTeamSeason(
  assignment: Omit<DriverTeamSeason, 'id' | 'created_at' | 'updated_at'>
): Promise<DriverTeamSeason> {
  const newAssignment: DriverTeamSeason = {
    ...assignment,
    id: 'a-' + Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('driver_team_seasons').insert([newAssignment]).select().single();
      if (!error && data) return data as DriverTeamSeason;
    } catch (err) {
      console.warn('Supabase createDriverTeamSeason error:', err);
    }
  }

  const assignments = getLocalItem<DriverTeamSeason[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  // Conflict checks: remove any prior driver assignment in the same season
  const filtered = assignments.filter(
    a => !(a.season_id === assignment.season_id && (a.driver_id === assignment.driver_id || (a.team_id === assignment.team_id && a.seat_number === assignment.seat_number)))
  );
  filtered.push(newAssignment);
  setLocalItem(STORAGE_KEYS.ASSIGNMENTS, filtered);
  return newAssignment;
}

export async function deleteDriverTeamSeason(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('driver_team_seasons').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteDriverTeamSeason error:', err);
    }
  }

  const assignments = getLocalItem<DriverTeamSeason[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  setLocalItem(STORAGE_KEYS.ASSIGNMENTS, assignments.filter(a => a.id !== id));
  return true;
}

// ==========================================
// CUSTOM LINEUPS SERVICE
// ==========================================
export async function getLineups(userId?: string, publicOnly = false): Promise<CustomLineup[]> {
  let list: CustomLineup[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('custom_lineups').select('*').order('created_at', { ascending: false });
      if (publicOnly) query = query.eq('visibility', 'public');
      else if (userId) query = query.or(`visibility.eq.public,created_by.eq.${userId}`);
      
      const { data, error } = await query;
      if (!error && data) {
        list = data as CustomLineup[];
      }
    } catch (err) {
      console.warn('Supabase getLineups error:', err);
    }
  } else {
    list = getLocalItem<CustomLineup[]>(STORAGE_KEYS.LINEUPS, []);
    if (publicOnly) {
      list = list.filter(l => l.visibility === 'public');
    } else if (userId) {
      list = list.filter(l => l.visibility === 'public' || l.created_by === userId);
    }
  }

  return list;
}

export async function getLineupById(id: string): Promise<CustomLineup | null> {
  const list = await getLineups();
  return list.find(l => l.id === id) || null;
}

export async function saveLineup(lineupData: Omit<CustomLineup, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<CustomLineup> {
  const id = lineupData.id || 'grid-' + Date.now().toString();
  const existingLineup = await getLineupById(id);

  const fullLineup: CustomLineup = {
    ...lineupData,
    id,
    created_at: existingLineup?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('custom_lineups').upsert({
        id: fullLineup.id,
        name: fullLineup.name,
        season_id: fullLineup.season_id,
        team_count: fullLineup.team_count,
        status: fullLineup.status,
        visibility: fullLineup.visibility,
        is_featured: fullLineup.is_featured || false,
        created_by: fullLineup.created_by || null,
        updated_at: fullLineup.updated_at,
      });
    } catch (err) {
      console.warn('Supabase saveLineup error:', err);
    }
  }

  const list = getLocalItem<CustomLineup[]>(STORAGE_KEYS.LINEUPS, []);
  const index = list.findIndex(l => l.id === id);
  if (index >= 0) {
    list[index] = fullLineup;
  } else {
    list.unshift(fullLineup);
  }
  setLocalItem(STORAGE_KEYS.LINEUPS, list);
  return fullLineup;
}

export async function deleteLineup(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('custom_lineups').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteLineup error:', err);
    }
  }

  const list = getLocalItem<CustomLineup[]>(STORAGE_KEYS.LINEUPS, []);
  setLocalItem(STORAGE_KEYS.LINEUPS, list.filter(l => l.id !== id));
  return true;
}

// ==========================================
// MEDIA & ASSET STORAGE SERVICE
// ==========================================
export async function uploadMedia(file: File, category: 'teams' | 'drivers' | 'cars' | 'posters', filename?: string): Promise<string> {
  const bucketMap = {
    teams: 'team-logos',
    drivers: 'driver-images',
    cars: 'car-images',
    posters: 'lineup-posters',
  };
  const bucket = bucketMap[category];
  const finalFilename = filename || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(finalFilename, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(finalFilename);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload error:', err);
    }
  }

  // Fallback: convert file to Base64 Data URL for local testing & preview
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const mediaLib = getLocalItem<Array<{ id: string; url: string; name: string; category: string; size: number }>>(
        STORAGE_KEYS.MEDIA,
        []
      );
      mediaLib.push({
        id: 'med-' + Date.now(),
        url: result,
        name: finalFilename,
        category,
        size: file.size,
      });
      setLocalItem(STORAGE_KEYS.MEDIA, mediaLib);
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file for local media store'));
    reader.readAsDataURL(file);
  });
}

export function getMediaLibrary(): Array<{ id: string; url: string; name: string; category: string; size: number }> {
  return getLocalItem<Array<{ id: string; url: string; name: string; category: string; size: number }>>(
    STORAGE_KEYS.MEDIA,
    []
  );
}

// ==========================================
// SUMMARY METRICS FOR ADMIN OVERVIEW
// ==========================================
export async function getStatsSummary() {
  const [teams, drivers, cars, seasons, assignments, lineups] = await Promise.all([
    getTeams(),
    getDrivers(),
    getTeamCars(),
    getSeasons(),
    getDriverTeamSeasons(),
    getLineups(),
  ]);

  return {
    teamsCount: teams.length,
    driversCount: drivers.length,
    carsCount: cars.length,
    seasonsCount: seasons.length,
    assignmentsCount: assignments.length,
    lineupsCount: lineups.length,
    publishedSeasonsCount: seasons.filter(s => s.is_published).length,
  };
}
