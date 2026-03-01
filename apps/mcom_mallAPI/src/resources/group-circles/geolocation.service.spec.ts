import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { GeolocationService } from './geolocation.service';

describe('GeolocationService', () => {
  let service: GeolocationService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeolocationService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GeolocationService>(GeolocationService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDistance', () => {
    it('should calculate the distance between London and Manchester correctly', () => {
      // London: 51.5074, -0.1278
      // Manchester: 53.4808, -2.2426
      const distance = service.calculateDistance(
        51.5074,
        -0.1278,
        53.4808,
        -2.2426,
      );

      // Approximately 262 km
      expect(distance).toBeGreaterThan(260);
      expect(distance).toBeLessThan(265);
    });

    it('should return 0 for the same coordinates', () => {
      const distance = service.calculateDistance(
        51.5074,
        -0.1278,
        51.5074,
        -0.1278,
      );
      expect(distance).toBe(0);
    });
  });

  describe('getCoordinates', () => {
    it('should fetch coordinates for a valid postcode', async () => {
      const mockResponse = {
        data: {
          status: 200,
          result: {
            latitude: 51.501,
            longitude: -0.141,
          },
        },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

      const coords = await service.getCoordinates('SW1A 1AA');
      expect(coords).toEqual({ lat: 51.501, lng: -0.141 });
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('SW1A%201AA'),
      );
    });

    it('should return null for an invalid postcode', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of({ data: { status: 404 } } as any));
      const coords = await service.getCoordinates('INVALID');
      expect(coords).toBeNull();
    });
  });

  describe('getBulkCoordinates', () => {
    it('should fetch coordinates for multiple postcodes', async () => {
      const mockResponse = {
        data: {
          status: 200,
          result: [
            { query: 'SW1A 1AA', result: { latitude: 51.5, longitude: -0.1 } },
            { query: 'M1 1AG', result: { latitude: 53.4, longitude: -2.2 } },
          ],
        },
      };
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as any));

      const coordsMap = await service.getBulkCoordinates([
        'SW1A 1AA',
        'M1 1AG',
      ]);
      expect(coordsMap.size).toBe(2);
      expect(coordsMap.get('SW1A 1AA')).toEqual({ lat: 51.5, lng: -0.1 });
      expect(coordsMap.get('M1 1AG')).toEqual({ lat: 53.4, lng: -2.2 });
    });
  });
});
