import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeolocationService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Calculates the distance between two points in kilometers using the Haversine formula.
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Fetches coordinates (latitude and longitude) for a UK postcode using postcodes.io.
   */
  async getCoordinates(
    postcode: string,
  ): Promise<{ lat: number; lng: number } | null> {
    if (!postcode) return null;

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
        ),
      );

      if (response.data && response.data.status === 200) {
        return {
          lat: response.data.result.latitude,
          lng: response.data.result.longitude,
        };
      }
      return null;
    } catch (error) {
      console.error(
        `Failed to fetch coordinates for postcode ${postcode}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Fetches coordinates for multiple postcodes in bulk.
   */
  async getBulkCoordinates(
    postcodes: string[],
  ): Promise<Map<string, { lat: number; lng: number }>> {
    const coordMap = new Map<string, { lat: number; lng: number }>();
    if (!postcodes || postcodes.length === 0) return coordMap;

    // Remove duplicates and nulls
    const uniquePostcodes = [...new Set(postcodes.filter(Boolean))];

    // postcodes.io supports bulk lookup up to 100 postcodes
    const chunks = [];
    for (let i = 0; i < uniquePostcodes.length; i += 100) {
      chunks.push(uniquePostcodes.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      try {
        const response = await firstValueFrom(
          this.httpService.post('https://api.postcodes.io/postcodes', {
            postcodes: chunk,
          }),
        );

        if (response.data && response.data.status === 200) {
          response.data.result.forEach((res: any) => {
            if (res.result) {
              coordMap.set(res.query, {
                lat: res.result.latitude,
                lng: res.result.longitude,
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch bulk coordinates:', error.message);
      }
    }

    return coordMap;
  }
}
