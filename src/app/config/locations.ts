export interface WeatherLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Approximate city centers checked against PhilAtlas, 28 October 2026.
export const LOCATIONS: readonly WeatherLocation[] = [
  {
    id: 'cabanatuan',
    name: 'Cabanatuan',
    latitude: 15.4902,
    longitude: 120.9665,
  },
  {
    id: 'san-jose',
    name: 'San Jose City',
    latitude: 15.7899,
    longitude: 120.99,
  },
  {
    id: 'palayan',
    name: 'Palayan',
    latitude: 15.5408,
    longitude: 121.0842,
  },
  {
    id: 'gapan',
    name: 'Gapan',
    latitude: 15.3126,
    longitude: 120.9495,
  },
  {
    id: 'munoz',
    name: 'Science City of Muñoz',
    latitude: 15.7144,
    longitude: 120.9041,
  },
];

export function findLocation(id: string | null): WeatherLocation | undefined {
  return LOCATIONS.find((location) => location.id === id);
}
