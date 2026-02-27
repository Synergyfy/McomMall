
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../utils/create-app';
import { createAuthenticatedUser } from '../utils/auth';
import { UserRole } from '../../src/common/role.enum';

describe('RBAC Flow (E2E)', () => {
  let app: INestApplication;
  let customerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const customer = await createAuthenticatedUser(app, UserRole.CUSTOMER);
    customerToken = customer.accessToken;

    const admin = await createAuthenticatedUser(app, UserRole.ADMIN);
    adminToken = admin.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should prevent a customer from creating an admin user (403)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/admin/create')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        email: `admin-attempt-${Date.now()}@example.com`,
        password: 'Password123!',
        confirm_password: 'Password123!',
        firstName: 'Hacker',
        lastName: 'Man',
        phoneNumber: '+19999999999',
        role: UserRole.ADMIN,
      });

    expect(response.status).toBe(403);
  });

  it('should allow an admin to create another admin user (201)', async () => {
    const email = `admin-success-${Date.now()}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/users/admin/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email,
        password: 'Password123!',
        confirm_password: 'Password123!',
        firstName: 'Real',
        lastName: 'Admin',
        phoneNumber: `+1${Math.floor(Math.random() * 10000000000)}`,
        role: UserRole.ADMIN,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('email', email);
  });
});
