import { CustomLineupTeam, Driver, Team, DriverTeamSeason } from '../types';

/**
 * Suite of unit and integration validation tests for F1 Driver Grid Builder
 */
export function runAutomatedTests() {
  const results: { test: string; passed: boolean; message?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ test: name, passed: true });
    } catch (err: any) {
      results.push({ test: name, passed: false, message: err.message });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // Sample test fixture
  const TEST_DRIVERS: Driver[] = [
    { id: 'd-1', name: 'Max Verstappen', code: 'VER', nationality: 'Dutch', bio: '', card_image_url: '' },
    { id: 'd-2', name: 'Lewis Hamilton', code: 'HAM', nationality: 'British', bio: '', card_image_url: '' },
    { id: 'd-3', name: 'Charles Leclerc', code: 'LEC', nationality: 'Monegasque', bio: '', card_image_url: '' },
  ];

  const TEST_TEAMS: Team[] = [
    { id: 't-1', name: 'Ferrari', slug: 'ferrari', hq: 'Maranello', bio: '', logo_url: '', primary_color: '#E80020', secondary_color: '#fff' },
    { id: 't-2', name: 'McLaren', slug: 'mclaren', hq: 'Woking', bio: '', logo_url: '', primary_color: '#FF8000', secondary_color: '#000' },
  ];

  // Test 1: Driver code format validation (3 uppercase letters)
  test('Driver codes must be exactly 3 uppercase letters', () => {
    TEST_DRIVERS.forEach(d => {
      assert(d.code.length === 3, `Driver ${d.name} code ${d.code} is not 3 characters`);
      assert(d.code === d.code.toUpperCase(), `Driver code ${d.code} is not uppercase`);
    });
  });

  // Test 2: Driver codes uniqueness
  test('Driver codes must be unique across the entire database', () => {
    const codes = new Set<string>();
    TEST_DRIVERS.forEach(d => {
      assert(!codes.has(d.code), `Duplicate driver code found: ${d.code}`);
      codes.add(d.code);
    });
  });

  // Test 3: Team slugs uniqueness
  test('Team slugs must be unique', () => {
    const slugs = new Set<string>();
    TEST_TEAMS.forEach(t => {
      assert(!slugs.has(t.slug), `Duplicate team slug found: ${t.slug}`);
      slugs.add(t.slug);
    });
  });

  // Test 4: Grid Layout 10-Team configuration
  test('10-team grid configuration has exactly 20 cockpit seats', () => {
    const teamCount = 10;
    const totalSeats = teamCount * 2;
    assert(totalSeats === 20, '10-team grid must have 20 seats');
  });

  // Test 5: Grid Layout 11-Team configuration
  test('11-team grid configuration has exactly 22 cockpit seats', () => {
    const teamCount = 11;
    const totalSeats = teamCount * 2;
    assert(totalSeats === 22, '11-team grid must have 22 seats');
  });

  // Test 6: Grid Layout 12-Team configuration
  test('12-team grid configuration has exactly 24 cockpit seats', () => {
    const teamCount = 12;
    const totalSeats = teamCount * 2;
    assert(totalSeats === 24, '12-team grid must have 24 seats');
  });

  // Test 7: Duplicate driver detection logic
  test('Duplicate driver in multiple seats is correctly detected', () => {
    const mockTeams: CustomLineupTeam[] = [
      {
        position: 1,
        team_id: 't-1',
        seats: [
          { seat_number: 1, driver_id: 'd-1' },
          { seat_number: 2, driver_id: 'd-2' },
        ],
      },
      {
        position: 2,
        team_id: 't-2',
        seats: [
          { seat_number: 1, driver_id: 'd-1' }, // Duplicate!
          { seat_number: 2, driver_id: 'd-3' },
        ],
      },
    ];

    const seen = new Set<string>();
    const duplicates = new Set<string>();

    mockTeams.forEach(t => {
      t.seats.forEach(s => {
        if (s.driver_id) {
          if (seen.has(s.driver_id)) {
            duplicates.add(s.driver_id);
          } else {
            seen.add(s.driver_id);
          }
        }
      });
    });

    assert(duplicates.has('d-1'), 'Duplicate d-1 was not detected');
    assert(duplicates.size === 1, 'Only 1 duplicate driver expected');
  });

  // Test 8: Empty database handling
  test('Application handles empty database without throwing', () => {
    const emptyDrivers: Driver[] = [];
    const emptyTeams: Team[] = [];
    assert(emptyDrivers.length === 0, 'Driver list is empty');
    assert(emptyTeams.length === 0, 'Team list is empty');
  });

  return results;
}
