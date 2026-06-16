import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PlacePhoto } from './listing.interface';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

// ─────────────────────────────────────────────────────────────
// Normalizer — converts Google's response to a stable schema.
// Google may return camelCase (new Places API) or snake_case
// (legacy Places API). This ensures the frontend always gets
// a consistent shape regardless of which version Google uses.
// ─────────────────────────────────────────────────────────────
function normalizePlaceResult(place: any): any {
  if (!place || typeof place !== 'object') return place;

  return {
    place_id:          place.place_id          ?? place.placeId          ?? null,
    name:              place.name                                          ?? null,
    formatted_address: place.formatted_address ?? place.formattedAddress  ?? place.vicinity ?? null,
    vicinity:          place.vicinity                                      ?? null,
    rating:            place.rating                                        ?? null,
    user_ratings_total: place.user_ratings_total ?? place.userRatingsTotal ?? null,
    business_status:   place.business_status   ?? place.businessStatus    ?? null,
    types:             place.types                                         ?? [],
    geometry:          place.geometry                                      ?? null,
    icon:              place.icon                                          ?? null,
    opening_hours: place.opening_hours
      ? place.opening_hours
      : place.openingHours
      ? {
          open_now:     place.openingHours.openNow     ?? null,
          weekday_text: place.openingHours.weekdayText ?? [],
        }
      : null,
    photos: Array.isArray(place.photos)
      ? place.photos.map((p: any) => ({
          photo_reference:   p.photo_reference   ?? p.photoReference   ?? null,
          height:            p.height                                   ?? null,
          width:             p.width                                    ?? null,
          html_attributions: p.html_attributions ?? p.htmlAttributions ?? [],
        }))
      : [],
    // Detail-only fields (from Place Details endpoint)
    formatted_phone_number:       place.formatted_phone_number       ?? place.formattedPhoneNumber       ?? null,
    international_phone_number:   place.international_phone_number   ?? place.internationalPhoneNumber   ?? null,
    website:                      place.website                                                          ?? null,
    plus_code:                    place.plus_code                    ?? place.plusCode                   ?? null,
    // Pass through any other fields we haven't mapped
    ...Object.fromEntries(
      Object.entries(place).filter(([key]) =>
        ![
          'placeId','place_id','formattedAddress','formatted_address','vicinity',
          'userRatingsTotal','user_ratings_total','businessStatus','business_status',
          'openingHours','opening_hours','photoReference','photos',
          'formattedPhoneNumber','formatted_phone_number',
          'internationalPhoneNumber','international_phone_number',
          'plusCode','plus_code',
        ].includes(key),
      ),
    ),
  };
}

@Injectable()
export class GooglePlacesService {
  private get apiKey(): string {
    return this.configService.get<string>('GOOGLE_API_KEY') || process.env.GOOGLE_API_KEY || '';
  }
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchGoogleBusinesses(query?: {
    lng: number;
    lat: number;
    queryText: string;
    radius?: number;
  }) {
    let location = '6.454075,3.394673';
    // Default radius is 5000 meters (5 km)
    const radiusMeters = query?.radius ? Math.round(query.radius * 1000) : 5000;
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?radius=${radiusMeters}&`;

    if (query) {
      const { lng, lat, queryText } = query;

      if (!queryText && !lat && !lng) {
        throw new BadRequestException('Pass query in the request');
      }

      if (queryText) url = url + `query=${queryText}&`;

      if (!queryText && lat && lng) {
        location = `${lat},${lng}`;
        url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=${radiusMeters}&`;
      }
      url = url + `location=${location}&`;
    }

    url = url + `key=${this.apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadRequestException('Failed to fetch Google Places data');
    }
    const data = await response.json();

    // Normalize every result to a consistent schema
    return {
      status: data.status,
      results: Array.isArray(data.results)
        ? data.results.map(normalizePlaceResult)
        : [],
    };
  }

  async fetchGoogleBusiness({ place_id }: { place_id: string }) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${this.apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const raw = response.data?.result ?? response.data ?? {};
      // Normalize the detail result to the same consistent schema
      return { result: normalizePlaceResult(raw) };
    } catch (error) {
      console.error('Error fetching Google Business details:', error);
      throw new Error('Failed to fetch business details.');
    }
  }

  async getPhotoStream(payload: PlacePhoto): Promise<AxiosResponse> {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

    if (!apiKey) {
      throw new Error('Server configuration error: Missing Google API Key.');
    }

    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${payload.photo_reference}&key=${apiKey}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(photoUrl, { responseType: 'stream' }),
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}


