import { useState, useEffect } from 'react';
import { HighStreet } from '../types/geo';
import { 
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
      
      const mappedTier = {
        'HIGH_STREET': 'high_street',
        'HYPERLOCAL': 'hyper_local',
        'NEARBY': 'nearby',
        'REMOTE': 'national'
      }[geoState.badge];
      
      if (mappedTier) {
        localStorage.setItem('businessProximityTier', mappedTier);
      }
      if (geoState.distanceToHighStreet !== null && geoState.distanceToHighStreet !== undefined) {
        localStorage.setItem('businessProximityDistance', geoState.distanceToHighStreet.toString());
      }
    }
  }, [geoState]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('businessOnboarding');
      if (raw) {
        try {
          const ob = JSON.parse(raw);
          const isMock = !geoState.nearestHighStreet || geoState.nearestHighStreet.id !== 'real_hs';
          if (ob.postcode && (ob.postcode !== geoState.postcode || isMock)) {
            analyzeLocation(ob.postcode);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [geoState.postcode, geoState.nearestHighStreet?.id]);

  const analyzeLocation = async (postcode: string) => {
    setGeoState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/business/check-proximity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode }),
      });
      if (!response.ok) {
        throw new Error("Failed to connect to the proximity service.");
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const tier = data.tier;
      const distance = data.distance;
      const nearestHighStreetName = data.nearestHighStreetName;
      const lat = data.latitude;
      const lon = data.longitude;

      let badge: GeographicBadge = 'REMOTE';
      if (tier === 'high_street') badge = 'HIGH_STREET';
      else if (tier === 'hyper_local') badge = 'HYPERLOCAL';
      else if (tier === 'nearby') badge = 'NEARBY';

      const resolvedHighStreet = {
        id: "real_hs",
        name: nearestHighStreetName || "High Street",
        latitude: lat || 51.5,
        longitude: lon || -0.1,
        radiusMiles: 0.5,
        borough: "",
        city: "",
        country: "UK",
        status: "active" as const,
        economicPriority: "standard" as const
      };

      setGeoState({
        postcode: data.postcode,
        latitude: lat,
        longitude: lon,
        nearestHighStreet: resolvedHighStreet,
        distanceToHighStreet: distance,
        badge,
        isLoading: false,
        error: null,
      });

      return { badge, highStreet: resolvedHighStreet, distanceMiles: distance, latitude: lat, longitude: lon };
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
