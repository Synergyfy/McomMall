
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
    const router = server._events.request._router;

    const availableRoutes: string[] = [];

    if (router && router.stack) {
        router.stack.forEach((layer) => {
            if (layer.route && layer.route.path) {
                // If the route handles GET requests
                if (layer.route.methods && layer.route.methods.get) {
                    availableRoutes.push(layer.route.path);
                }
            }
        });
    }

    if (availableRoutes.length === 0) {
        console.warn("No routes found for smoke test! Ensure controllers are registered.");
    } else {
        console.log(`Checking ${availableRoutes.length} GET routes...`);
    }

    // Iterate sequentially to avoid overwhelming the server or causing timeouts
    for (const routePath of availableRoutes) {
       let testPath = routePath;
       // Replace :param with 'dummy-id'
       if (typeof testPath === 'string') {
          testPath = testPath.replace(/:[a-zA-Z0-9_]+/g, 'dummy-id');
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
