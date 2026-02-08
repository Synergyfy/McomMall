import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('listings')
@Controller('google/google-business')
@Public()
export class ListingsGoogleController {
  constructor(private readonly googlePlacesService: GooglePlacesService) {}

  @Public()
  @Get()
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
  fetchGoogleBusiness(@Param('placeId') placeId: string) {
    return this.googlePlacesService.fetchGoogleBusiness({ place_id: placeId });
  }

  @Get('photo/:photoReference')
  @ApiOperation({ summary: 'Retrieve a photo by its reference' })
  @ApiResponse({ status: 200, description: 'Photo retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid photo reference' })
  @ApiResponse({ status: 500, description: 'Failed to load image' })
  async getPlacePhoto(
    @Param('photoReference') photoReference: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (!photoReference || typeof photoReference !== 'string') {
        res.status(HttpStatus.BAD_REQUEST).send('Invalid photo reference.');
        return;
      }

      const photoResponse = await this.googlePlacesService.getPhotoStream({
        photo_reference: photoReference,
      });

      if (!photoResponse?.data) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('Invalid photo stream.');
        return;
      }

      const contentType = photoResponse.headers['content-type'] || 'image/jpeg';
      res.set('Content-Type', contentType);

      photoResponse.data.on('error', (err) => {
        if (!res.headersSent) {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send('Failed to stream image.');
        }
      });

      photoResponse.data.pipe(res);
    } catch (error) {
      const status = error?.response?.status ?? 500;
      res.status(Number(status)).send({
        message: 'Failed to load image.',
        error: error?.message || 'Unknown error',
      });
    }
  }
}
