import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { ServiceMeshService } from '../service-mesh/services/service-mesh.service';
import { sanitiseMediaPath } from './media-proxy.util';

const MEDIA_FETCH_TIMEOUT_MS = 10_000;
const MAX_MEDIA_BYTES = 15 * 1024 * 1024;

export interface ProxiedMedia {
  data: Buffer;
  contentType: string;
}

/**
 * Fetches Central-hosted uploads on behalf of the browser.
 *
 * Central's `/uploads` is closed to anonymous requests (it requires a Central
 * JWT), so `<img src>` can never load those files directly. This service mints
 * a short-lived RS256 token (`central:read`) through the service mesh and pulls
 * the bytes from Central's `/api/v1/ecosystem/media` endpoint instead.
 */
@Injectable()
export class MediaProxyService {
  private readonly logger = new Logger(MediaProxyService.name);

  constructor(private readonly serviceMesh: ServiceMeshService) {}

  async fetchCentralAsset(requestedPath: string): Promise<ProxiedMedia> {
    const path = sanitiseMediaPath(requestedPath);
    if (!path) {
      throw new BadRequestException('Invalid media path');
    }

    let token: string;
    try {
      token = await this.serviceMesh.getServiceToken(
        'mcom-central',
        'central:read',
      );
    } catch (error) {
      this.logger.error(
        `Could not mint central:read token for media ${path}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new ServiceUnavailableException('Media service unavailable');
    }

    const url = `${this.serviceMesh.getSolutionsUrl()}/api/v1/ecosystem/media/${path}`;

    try {
      const response = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        timeout: MEDIA_FETCH_TIMEOUT_MS,
        maxContentLength: MAX_MEDIA_BYTES,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'image/*',
        },
      });

      return {
        data: Buffer.from(response.data),
        contentType: String(
          response.headers['content-type'] || 'application/octet-stream',
        ),
      };
    } catch (error) {
      const status = (error as any)?.response?.status as number | undefined;
      this.logger.warn(
        `Central media ${path} could not be fetched` +
          (status ? ` (HTTP ${status})` : '') +
          `: ${error instanceof Error ? error.message : String(error)}`,
      );
      // A missing/unreachable image must not surface as a 500 to the browser.
      throw new NotFoundException('Media not found');
    }
  }
}
