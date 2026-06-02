import { HighStreet, HIGH_STREET_REGISTRY } from "../mock-data/high-street-data";

export type GeographicBadge = "HIGH_STREET" | "HYPERLOCAL" | "NEARBY" | "REMOTE";

/**
 * Calculates the Haversine distance between two coordinates in miles
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRadian = (angle: number) => (Math.PI / 180) * angle;
  const distance = (a: number, b: number) => (Math.PI / 180) * (a - b);
  
  const R = 3958.8; // Radius of Earth in miles
  const dLat = distance(lat2, lat1);
  const dLon = distance(lon2, lon1);
  
  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);
  
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));
  
  return R * c;
}

export interface NearestHighStreetResult {
  highStreet: HighStreet;
  distanceMiles: number;
}

/**
 * Finds the nearest High Street from the registry
 */
export function findNearestHighStreet(lat: number, lon: number): NearestHighStreetResult {
  let nearest: HighStreet = HIGH_STREET_REGISTRY[0];
  let minDistance = calculateHaversineDistance(lat, lon, nearest.latitude, nearest.longitude);

  for (let i = 1; i < HIGH_STREET_REGISTRY.length; i++) {
    const hs = HIGH_STREET_REGISTRY[i];
    const dist = calculateHaversineDistance(lat, lon, hs.latitude, hs.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hs;
    }
  }

  return { highStreet: nearest, distanceMiles: minDistance };
}

/**
 * Classifies a business based on distance to its nearest high street
 */
export function classifyBusiness(distanceMiles: number, hsRadiusMiles: number): GeographicBadge {
  if (distanceMiles <= hsRadiusMiles) {
    return "HIGH_STREET";
  } else if (distanceMiles > hsRadiusMiles && distanceMiles <= 5) {
    return "HYPERLOCAL";
  } else if (distanceMiles > 5 && distanceMiles <= 8) {
    return "NEARBY";
  } else {
    return "REMOTE";
  }
}
