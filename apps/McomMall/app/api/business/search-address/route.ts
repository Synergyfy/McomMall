import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postcode = searchParams.get('postcode');

    if (!postcode) {
      return NextResponse.json({ error: 'Postcode query parameter is required' }, { status: 400 });
    }

    const formattedPostcode = postcode.trim().toUpperCase();

    // Query Nominatim for the postcode
    // limit=5, addressdetails=1 so we get city/town/road details
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formattedPostcode)}&format=json&addressdetails=1&limit=5`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'McomMall-Onboarding/1.0 (contact@mcommall.com)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from mapping system' }, { status: response.status });
    }

    const data = await response.json();

    const suggestions = data.map((item: any) => {
      const address = item.address || {};
      return {
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        city: address.city || address.town || address.village || address.suburb || address.county || '',
        road: address.road || '',
        postcode: address.postcode || formattedPostcode,
      };
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
