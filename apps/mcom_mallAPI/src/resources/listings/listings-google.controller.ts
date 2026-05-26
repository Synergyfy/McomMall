import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('listings')
@Controller('google/google-business')
@Public()
export class ListingsGoogleController {
  constructor(private readonly googlePlacesService: GooglePlacesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search for businesses using Google Places API' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  @ApiQuery({
    name: 'queryText',
    type: String,
    description: 'Search text (e.g., "coffee shop")',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of Google Maps businesses.',
    example: [
      {
        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        name: 'Google Sydney',
        geometry: {
          location: {
            lat: -33.866651,
            lng: 151.195827,
          },
        },
        vicinity: '48 Pirrama Road, Pyrmont',
        formatted_address: '48 Pirrama Road, Pyrmont NSW 2009, Australia',
        rating: 4.5,
        user_ratings_total: 123,
      },
    ],
  })
  fetchGoogleBusinesses(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('queryText') queryText: string,
  ) {
    return this.googlePlacesService.fetchGoogleBusinesses({
      lng,
      lat,
      queryText,
    });
  }

  @Get(':placeId')
  @ApiOperation({ summary: 'Get details of a specific Google Business' })
  @ApiParam({ name: 'placeId', description: 'Google Place ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed information about a Google Business.',
    example: {
      place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      name: 'Google Sydney',
      formatted_address: '48 Pirrama Road, Pyrmont NSW 2009, Australia',
      formatted_phone_number: '(02) 9374 4000',
      international_phone_number: '+61 2 9374 4000',
      website: 'https://www.google.com.au/about/careers/locations/sydney/',
      rating: 4.5,
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Monday: 9:00 AM – 5:00 PM',
          'Tuesday: 9:00 AM – 5:00 PM',
        ],
      },
      photos: [
        {
          photo_reference: 'CnDnAAAA...',
          height: 100,
          width: 100,
        },
      ],
    },
  })
  fetchGoogleBusiness(@Param('placeId') placeId: string) {
    return this.googlePlacesService.fetchGoogleBusiness({ place_id: placeId });
  }

  @Get('photo/:photoReference')
  @ApiOperation({ summary: 'Retrieve a photo by its reference (redirects directly to Google CDN)' })
  @ApiResponse({ status: 302, description: 'Redirected to Google Place Photo URL' })
  @ApiResponse({ status: 400, description: 'Invalid photo reference' })
  @ApiResponse({ status: 500, description: 'Failed to resolve photo URL' })
  async getPlacePhoto(
    @Param('photoReference') photoReference: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (!photoReference || typeof photoReference !== 'string') {
        res.status(HttpStatus.BAD_REQUEST).send('Invalid photo reference.');
        return;
      }

      const apiKey = this.googlePlacesService['apiKey'];
      if (!apiKey) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('Server configuration error: Missing Google API Key.');
        return;
      }

      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;

      // Set cache-control headers so the browser caches the redirect!
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache redirect for 1 day
      res.redirect(HttpStatus.FOUND, photoUrl);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Failed to resolve photo URL.',
        error: error?.message || 'Unknown error',
      });
    }
  }
}
