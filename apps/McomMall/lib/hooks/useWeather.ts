import { useQuery } from '@tanstack/react-query';

export interface WeatherSnapshot {
  available: boolean;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  weatherCode?: number;
  condition?: string;
  icon?: string;
  updatedAt?: string;
}

interface WeatherParams {
  latitude?: number | null;
  longitude?: number | null;
  postcode?: string | null;
}

const fetchWeather = async (
  params: WeatherParams,
): Promise<WeatherSnapshot> => {
  const search = new URLSearchParams();
  if (typeof params.latitude === 'number') {
    search.set('lat', String(params.latitude));
  }
  if (typeof params.longitude === 'number') {
    search.set('lng', String(params.longitude));
  }
  if (params.postcode) {
    search.set('postcode', params.postcode);
  }

  const response = await fetch(`/api/weather?${search.toString()}`);
  if (!response.ok) {
    return { available: false };
  }
  return response.json();
};

/**
 * Current weather for the shopper's resolved location. The API route hides the
 * upstream provider and returns `{ available: false }` when coordinates cannot
 * be resolved, so the UI never falls back to hard-coded demo values.
 */
export const useWeather = (params: WeatherParams) => {
  const hasLocation =
    (typeof params.latitude === 'number' &&
      typeof params.longitude === 'number') ||
    Boolean(params.postcode);

  return useQuery<WeatherSnapshot>({
    queryKey: [
      'weather',
      params.latitude ?? null,
      params.longitude ?? null,
      params.postcode ?? null,
    ],
    queryFn: () => fetchWeather(params),
    enabled: hasLocation,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
};
