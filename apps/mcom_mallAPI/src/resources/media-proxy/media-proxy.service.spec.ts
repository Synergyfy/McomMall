import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { MediaProxyService } from './media-proxy.service';

jest.mock('axios');

const mockedGet = axios.get as jest.Mock;

describe('MediaProxyService', () => {
  let service: MediaProxyService;
  let serviceMesh: {
    getServiceToken: jest.Mock;
    getSolutionsUrl: jest.Mock;
  };

  beforeEach(() => {
    mockedGet.mockReset();
    serviceMesh = {
      getServiceToken: jest.fn().mockResolvedValue('rs256-token'),
      getSolutionsUrl: jest.fn().mockReturnValue('http://central.test'),
    };
    service = new MediaProxyService(serviceMesh as any);
  });

  it('fetches the asset through Central with a central:read token', async () => {
    mockedGet.mockResolvedValue({
      data: Buffer.from('image-bytes'),
      headers: { 'content-type': 'image/png' },
    });

    const result = await service.fetchCentralAsset('abc-123.png');

    expect(serviceMesh.getServiceToken).toHaveBeenCalledWith(
      'mcom-central',
      'central:read',
    );
    expect(mockedGet).toHaveBeenCalledWith(
      'http://central.test/api/v1/ecosystem/media/abc-123.png',
      expect.objectContaining({
        responseType: 'arraybuffer',
        headers: expect.objectContaining({
          Authorization: 'Bearer rs256-token',
        }),
      }),
    );
    expect(result.contentType).toBe('image/png');
    expect(result.data.toString()).toBe('image-bytes');
  });

  it('rejects unsafe paths without calling Central', async () => {
    await expect(service.fetchCentralAsset('../secret.png')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('maps a Central 404 to a clean 404', async () => {
    mockedGet.mockRejectedValue(
      Object.assign(new Error('Not Found'), { response: { status: 404 } }),
    );

    await expect(service.fetchCentralAsset('missing.png')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('surfaces token-minting failures as 503', async () => {
    serviceMesh.getServiceToken.mockRejectedValue(new Error('no credentials'));

    await expect(service.fetchCentralAsset('abc.png')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
