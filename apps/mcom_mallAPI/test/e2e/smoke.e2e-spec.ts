import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../utils/create-app';

describe('Smoke Test (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not return 500 on any registered GET route', async () => {
    const server = app.getHttpServer();
    const expressInstance = (app as any).getHttpAdapter().getInstance();

    // Try to find router in common Express/NestJS locations
    const router =
      expressInstance._router ||
      expressInstance.router ||
      (expressInstance.app && expressInstance.app._router);

    const availableRoutes: string[] = [];

    if (router && router.stack) {
      router.stack.forEach((layer: any) => {
        if (layer.route && layer.route.path) {
          // If the route handles GET requests
          if (layer.route.methods && layer.route.methods.get) {
            availableRoutes.push(layer.route.path);
          }
        } else if (layer.name === 'router') {
          if (layer.handle && layer.handle.stack) {
            layer.handle.stack.forEach((subLayer: any) => {
              if (subLayer.route && subLayer.route.path) {
                if (subLayer.route.methods && subLayer.route.methods.get) {
                  availableRoutes.push(subLayer.route.path);
                }
              }
            });
          }
        }
      });
    }

    if (availableRoutes.length === 0) {
      throw new Error(
        'No routes found for smoke test! Ensure controllers are registered.',
      );
    }

    const dummyUuid = '00000000-0000-0000-0000-000000000000';

    // Iterate sequentially to avoid overwhelming the server or causing timeouts
    for (const routePath of availableRoutes) {
      let testPath = routePath;
      // Replace :param with a dummy UUID
      if (typeof testPath === 'string') {
        testPath = testPath.replace(/:[a-zA-Z0-9_]+/g, dummyUuid);
      } else {
        continue;
      }

      try {
        const res = await request(server).get(testPath);
        if (res.status === 500) {
          console.error(`Route GET ${testPath} FAILED with 500`);
          console.error(res.body);
        }
        expect(res.status).not.toBe(500);
      } catch (error) {
        console.error(`Error requesting ${testPath}`, error);
        throw error;
      }
    }
  }, 120000);
});
