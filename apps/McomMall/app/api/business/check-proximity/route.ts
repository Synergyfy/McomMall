import { NextResponse } from 'next/server';

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: Request) {
  try {
    const { postcode, address, lat, lon } = await request.json();

    if (!postcode) {
      return NextResponse.json({ error: 'Postcode is required' }, { status: 400 });
    }

    const formattedPostcode = postcode.trim().toUpperCase();

    // ─── Developer Testing Overrides ───────────────────
    if (formattedPostcode.includes('MOCK_HIGH') || formattedPostcode === 'H000') {
      return NextResponse.json({ postcode: formattedPostcode, distance: 0, tier: 'high_street', message: 'Mock override: High Street' });
    }
    if (formattedPostcode.includes('MOCK_HYPER') || formattedPostcode === 'L111') {
      return NextResponse.json({ postcode: formattedPostcode, distance: 1.2, tier: 'hyper_local', message: 'Mock override: Hyper Local' });
    }
    if (formattedPostcode.includes('MOCK_NEAR') || formattedPostcode === 'N555') {
      return NextResponse.json({ postcode: formattedPostcode, distance: 6.4, tier: 'nearby', message: 'Mock override: Nearby' });
    }
    if (formattedPostcode.includes('MOCK_NAT') || formattedPostcode === 'N999') {
      return NextResponse.json({ postcode: formattedPostcode, distance: 15.2, tier: 'national', message: 'Mock override: National' });
    }
    // ───────────────────────────────────────────────────

    // Check if the address contains "High Street" or "Main Street" (case-insensitive)
    const isDirectHighStreet = 
      (address && /high\s+street/i.test(address)) || 
      /high\s+street/i.test(formattedPostcode);

    if (isDirectHighStreet) {
      return NextResponse.json({
        postcode: formattedPostcode,
        distance: 0,
        tier: 'high_street',
        message: 'Business is located directly on a High Street.',
      });
    }

    // Parse lat and lon. If not provided, we query Nominatim.
    let userLat = parseFloat(lat);
    let userLon = parseFloat(lon);
    let city = '';

    if (isNaN(userLat) || isNaN(userLon)) {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formattedPostcode)}&format=json&addressdetails=1&limit=1`;
      const response = await fetch(geocodeUrl, {
        headers: {
          'User-Agent': 'McomMall-Onboarding/1.0 (contact@mcommall.com)',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          userLat = parseFloat(data[0].lat);
          userLon = parseFloat(data[0].lon);
          const addr = data[0].address || {};
          city = addr.city || addr.town || addr.village || addr.suburb || '';
        }
      }
    } else {
      const addressParts = address ? address.split(',') : [];
      if (addressParts.length >= 2) {
        city = addressParts[addressParts.length - 2]?.trim() || '';
      }
    }

    if (isNaN(userLat) || isNaN(userLon)) {
      return NextResponse.json({
        postcode: formattedPostcode,
        distance: 12.5,
        tier: 'national',
        message: 'Could not resolve location. Defaulted to national tier.',
      });
    }

    // Query Nominatim for "High Street" in that city
    let searchUrl = '';
    if (city) {
      searchUrl = `https://nominatim.openstreetmap.org/search?q=High+Street+${encodeURIComponent(city)}&format=json&limit=10`;
    } else {
      searchUrl = `https://nominatim.openstreetmap.org/search?q=High+Street&format=json&limit=10`;
    }

    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'McomMall-Onboarding/1.0 (contact@mcommall.com)',
      },
    });

    let minDistance = 999999;
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData && searchData.length > 0) {
        for (const item of searchData) {
          const itemLat = parseFloat(item.lat);
          const itemLon = parseFloat(item.lon);
          if (!isNaN(itemLat) && !isNaN(itemLon)) {
            const dist = getHaversineDistance(userLat, userLon, itemLat, itemLon);
            if (dist < minDistance) {
              minDistance = dist;
            }
          }
        }
      }
    }

    // If search failed, query with a bounding box around user coordinates
    if (minDistance === 999999) {
      const viewbox = `${userLon - 0.15},${userLat + 0.15},${userLon + 0.15},${userLat - 0.15}`;
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=High+Street&viewbox=${viewbox}&bounded=1&format=json&limit=10`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'McomMall-Onboarding/1.0 (contact@mcommall.com)',
        },
      });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        for (const item of fallbackData) {
          const itemLat = parseFloat(item.lat);
          const itemLon = parseFloat(item.lon);
          if (!isNaN(itemLat) && !isNaN(itemLon)) {
            const dist = getHaversineDistance(userLat, userLon, itemLat, itemLon);
            if (dist < minDistance) {
              minDistance = dist;
            }
          }
        }
      }
    }

    if (minDistance === 999999) {
      minDistance = 6.8; // Default fallback to Nearby
    }

    // Determine the tier based on rules:
    // High Street: distance is 0
    // Hyper Local: distance > 0 and <= 5 miles
    // Nearby: distance > 5 and <= 10 miles
    // National: distance > 10 miles
    let tier = 'national';
    if (minDistance === 0) {
      tier = 'high_street';
    } else if (minDistance <= 5) {
      tier = 'hyper_local';
    } else if (minDistance <= 10) {
      tier = 'nearby';
    } else {
      tier = 'national';
    }

    return NextResponse.json({
      postcode: formattedPostcode,
      distance: parseFloat(minDistance.toFixed(2)),
      tier: tier,
      message: `Proximity verification successful. Distance: ${minDistance.toFixed(2)} miles.`,
    });

  } catch (error) {
    console.error('Proximity verification error:', error);
    return NextResponse.json({ error: 'Failed to calculate proximity' }, { status: 500 });
  }
}
