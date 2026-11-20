import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { MediaProxyService } from './media-proxy.service';

/**
 * Public image proxy for Central-hosted uploads.
 *
 * Central keeps `/uploads` behind a Bearer token, so the browser cannot load
 * logos, banners or gallery images directly. The storefront asks this endpoint
 * for the bytes and the backend fetches them over the RS256 service mesh.
 *
 *   GET /api/v1/media/central?path=<relative-path>
 */
@ApiTags('media')
@Controller('media')
export class MediaProxyController {
  constructor(private readonly mediaProxy: MediaProxyService) {}

  @Public()
  @Get('central')
  @ApiOperation({
    summary: 'Proxy a Central-hosted image to the browser',
  })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Upload path relative to Central /uploads, e.g. "<uuid>.png"',
    example: 'b60ee38a-d6ed-419a-ab4a-3a28c8ec4209.png',
  })
  @ApiResponse({ status: 200, description: 'Image bytes' })
  @ApiResponse({ status: 400, description: 'Invalid media path' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async getCentralMedia(
    @Query('path') path: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!path) {
      throw new BadRequestException('path query parameter is required');
    }

    const asset = await this.mediaProxy.fetchCentralAsset(path);

    res.setHeader('Content-Type', asset.contentType);
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800',
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Written directly (no returned value) so the global ClassSerializer
    // interceptor never walks the binary buffer / stream.
    res.end(asset.data);
  }
}
