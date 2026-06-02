import { useState, useEffect } from 'react';
import { mockGeocodePostcode, HighStreet } from '../mock-data/high-street-data';
import { 
  findNearestHighStreet, 
  classifyBusiness, 
  GeographicBadge 
} from '../utils/geo-utils';

export interface GeoState {
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  nearestHighStreet: HighStreet | null;
  distanceToHighStreet: number | null;
  badge: GeographicBadge | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeoIntelligence() {
  const [geoState, setGeoState] = useState<GeoState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mcom_geo_state');
      if (saved) return JSON.parse(saved);
    }
    return {
      postcode: null,
      latitude: null,
      longitude: null,
      nearestHighStreet: null,
      distanceToHighStreet: null,
      badge: null,
      isLoading: false,
      error: null,
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && geoState.badge) {
      localStorage.setItem('mcom_geo_state', JSON.stringify(geoState));
    }
  }, [geoState]);

  const analyzeLocation = async (postcode: string) => {
    setGeoState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const geoResult = await mockGeocodePostcode(postcode);
      
      if (!geoResult) {
        throw new Error("Could not find location for the provided postcode.");
      }

      const { highStreet, distanceMiles } = findNearestHighStreet(
        geoResult.latitude, 
        geoResult.longitude
      );

      const badge = classifyBusiness(distanceMiles, highStreet.radiusMiles);

      setGeoState({
        postcode: geoResult.postcode,
        latitude: geoResult.latitude,
        longitude: geoResult.longitude,
        nearestHighStreet: highStreet,
        distanceToHighStreet: distanceMiles,
        badge,
        isLoading: false,
        error: null,
      });

      return { badge, highStreet, distanceMiles, latitude: geoResult.latitude, longitude: geoResult.longitude };
    } catch (err: any) {
      setGeoState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "An error occurred during location analysis." 
      }));
      return null;
    }
  };

  return {
    ...geoState,
    analyzeLocation
  };
}
