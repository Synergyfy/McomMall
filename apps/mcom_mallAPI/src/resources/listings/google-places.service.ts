import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PlacePhoto } from './listing.interface';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
export class GooglePlacesService {
  private readonly apiKey = process.env.GOOGLE_API_KEY;
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
        console.log('running here');
        location = `${lat},${lng}`;
        url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=${radiusMeters}&`;
      }
      url = url + `location=${location}&`;
    }

    url = url + `key=${this.apiKey}`;

    console.log({ url });

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadRequestException('Failed to fetch Google Places data');
    }
    const data = await response.json();
    return data;
  }

  async fetchGoogleBusiness({ place_id }: { place_id: string }) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${this.apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));

      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to business.');
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
