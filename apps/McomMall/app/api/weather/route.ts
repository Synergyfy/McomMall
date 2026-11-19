import type { NextRequest } from 'next/server';

const WEATHER_LABELS: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear sky', icon: 'sun' },
  1: { condition: 'Mainly clear', icon: 'sun' },
  2: { condition: 'Partly cloudy', icon: 'cloud-sun' },
  3: { condition: 'Overcast', icon: 'cloud' },
  45: { condition: 'Fog', icon: 'cloud-fog' },
  48: { condition: 'Freezing fog', icon: 'cloud-fog' },
  51: { condition: 'Light drizzle', icon: 'cloud-drizzle' },
  53: { condition: 'Drizzle', icon: 'cloud-drizzle' },
  55: { condition: 'Heavy drizzle', icon: 'cloud-drizzle' },
  56: { condition: 'Freezing drizzle', icon: 'cloud-drizzle' },
  57: { condition: 'Freezing drizzle', icon: 'cloud-drizzle' },
  61: { condition: 'Light rain', icon: 'cloud-rain' },
  63: { condition: 'Rain', icon: 'cloud-rain' },
  65: { condition: 'Heavy rain', icon: 'cloud-rain' },
  66: { condition: 'Freezing rain', icon: 'cloud-rain' },
  67: { condition: 'Freezing rain', icon: 'cloud-rain' },
  71: { condition: 'Light snow', icon: 'cloud-snow' },
  73: { condition: 'Snow', icon: 'cloud-snow' },
  75: { condition: 'Heavy snow', icon: 'cloud-snow' },
  77: { condition: 'Snow grains', icon: 'cloud-snow' },
  80: { condition: 'Rain showers', icon: 'cloud-rain' },
  81: { condition: 'Rain showers', icon: 'cloud-rain' },
  82: { condition: 'Violent rain showers', icon: 'cloud-rain' },
  85: { condition: 'Snow showers', icon: 'cloud-snow' },
  86: { condition: 'Heavy snow showers', icon: 'cloud-snow' },
  95: { condition: 'Thunderstorm', icon: 'cloud-lightning' },
  96: { condition: 'Thunderstorm with hail', icon: 'cloud-lightning' },
  99: { condition: 'Thunderstorm with hail', icon: 'cloud-lightning' },
};

interface Coordinates {
  latitude: number;
  longitude: number;
}

async function resolvePostcode(postcode: string): Promise<Coordinates | null> {
  const compact = postcode.replace(/\s+/g, '').toUpperCase();
  if (!compact) return null;

  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(compact)}`,
      { next: { revalidate: 24 * 60 * 60 } },
    );
    if (!response.ok) return null;
    const body = await response.json();
    const result = body?.result;
    if (!result) return null;
    return {
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const postcode = searchParams.get('postcode');

  let latitude = latParam === null ? null : Number(latParam);
  let longitude = lngParam === null ? null : Number(lngParam);

  const hasValidCoordinates =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (!hasValidCoordinates && postcode) {
    const resolved = await resolvePostcode(postcode);
    latitude = resolved?.latitude ?? null;
    longitude = resolved?.longitude ?? null;
  }

  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return Response.json(
      { available: false, reason: 'missing_coordinates' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    );
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url.toString(), {
      next: { revalidate: 15 * 60 },
    });
    if (!response.ok) {
      return Response.json({ available: false, reason: 'provider_error' });
    }

    const body = await response.json();
    const current = body?.current;
    if (!current) {
      return Response.json({ available: false, reason: 'provider_error' });
    }

    const weatherCode = Number(current.weather_code);
    const label = WEATHER_LABELS[weatherCode] ?? {
      condition: 'Unknown',
      icon: 'cloud',
    };

    return Response.json(
      {
        available: true,
        latitude,
        longitude,
        temperature: Math.round(Number(current.temperature_2m)),
        humidity: Math.round(Number(current.relative_humidity_2m)),
        windSpeed: Math.round(Number(current.wind_speed_10m)),
        weatherCode,
        condition: label.condition,
        icon: label.icon,
        updatedAt: current.time ?? new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800',
        },
      },
    );
  } catch {
    return Response.json({ available: false, reason: 'provider_error' });
  }
}
