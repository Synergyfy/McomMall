import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PaymentProviderService } from '../src/resources/payments/services/payment-provider.service';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/resources/users/users.service';
import { clearDatabase } from './test-utils';
import { UserRole } from '../src/common/role.enum';
import { Service } from 'src/resources/services/entities/service.entity';
import { PricingModel } from 'src/resources/services/service.enum';
import { Business } from 'src/resources/listings/entities/listing.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceBooking } from 'src/resources/booking/entities/service-booking.entity';
import {
  ListingType,
  BusinessStatus,
} from 'src/resources/listings/listing.enum';

/**
 * E2E TEST SUITE: Booking Lifecycle & Capacity Guards
 *
 * Strategy:
 * 1. Setup: Creates real users, business, and service with defined capacity (maxBookings).
 * 2. Overbooking Protection: Attempts to book two overlapping slots when capacity is 1.
 *    - Expects 409 Conflict for the second attempt.
 * 3. Dynamic Pricing: Validates that perHour services are charged correctly based on duration.
 * 4. Escrow Handshake: Mocks the payment initiation and verifies the totalAmount storage.
 */


const mockPaymentProviderService = {
  createStripePaymentIntent: jest.fn().mockResolvedValue({
    id: 'pi_test_123',
    client_secret: 'pi_test_123_secret',
    status: 'succeeded',
    currency: 'gbp',
    amount: 1000,
  }),
  createPaypalOrder: jest.fn().mockResolvedValue({
    id: 'ORDER-123',
    status: 'CREATED',
    links: [
      { href: 'https://paypal.com/checkout?token=ORDER-123', rel: 'approve' },
    ],
  }),
  capturePaypalOrder: jest.fn().mockResolvedValue({
    status: 'COMPLETED',
    purchase_units: [
      {
        payments: {
          captures: [
            {
              amount: { value: '10.00', currency_code: 'GBP' },
            },
          ],
        },
      },
    ],
  }),
  verifyStripePaymentIntent: jest.fn().mockResolvedValue({
    ok: true,
    details: { status: 'succeeded' },
  }),
  captureAndVerifyPaypalOrder: jest.fn().mockResolvedValue({
    ok: true,
    details: { status: 'COMPLETED' },
  }),
};

describe('Booking Lifecycle (e2e)', () => {

  let app: INestApplication;
  let customerToken: string;
  let serviceRepo: Repository<Service>;
  let bizRepo: Repository<Business>;
  let testService: Service;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
            .overrideProvider(MailerService)
      .useValue({ sendMail: jest.fn().mockResolvedValue({}) })
      .overrideProvider(PaymentProviderService)
      .useValue(mockPaymentProviderService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await clearDatabase(app);

    const usersService = app.get(UsersService);
    serviceRepo = app.get<Repository<Service>>(getRepositoryToken(Service));
    bizRepo = app.get<Repository<Business>>(getRepositoryToken(Business));

    // Create Owner & Business
    const owner = await usersService.create({
      firstName: 'Provider',
      lastName: 'X',
      email: 'biz@test.com',
      password: 'password123',
      confirm_password: 'password123',
      phoneNumber: '111',
      role: UserRole.OWNER,
    });

    const biz = await bizRepo.save(
      bizRepo.create({
        businessName: 'Capacity Biz',
        user: owner,
        listingType: [ListingType.SERVICE],
        status: BusinessStatus.PUBLISHED,
        businessPhone: '111',
        shortDescription: 'Test',
      }),
    );

    // Create Service with max 1 booking at once
    testService = await serviceRepo.save(
      serviceRepo.create({
        name: 'Solo Service',
        business: biz,
        isActive: true,
        pricingModel: PricingModel.FIXED,
        fixedPrice: 100,
        availability: {
          maxBookingsPerSlot: 1, // Service level default
          schedule: [
            {
              day: 'MONDAY',
              enabled: true,
              startTime: '00:00',
              endTime: '23:59',
              maxBookings: 1,
            },
            {
              day: 'TUESDAY',
              enabled: true,
              startTime: '00:00',
              endTime: '23:59',
              maxBookings: 1,
            },
            {
              day: 'WEDNESDAY',
              enabled: true,
              startTime: '00:00',
              endTime: '23:59',
              maxBookings: 1,
            },
            {
              day: 'THURSDAY',
              enabled: true,
              startTime: '00:00',
              endTime: '23:59',
              maxBookings: 1,
            },
            {
              day: 'FRIDAY',
              enabled: true,
              startTime: '00:00',
              endTime: '23:59',
              maxBookings: 1,
            },
            {
              day: 'SATURDAY',
              enabled: true,
              startTime: '00:00',
              endTime: '23:59',
              maxBookings: 1,
            },
            {
              day: 'SUNDAY',
              enabled: true,
              startTime: '00:00',
              endTime: '23:59',
              maxBookings: 1,
            },
          ],
        },
      }),
    );

    // Create Customer
    await usersService.create({
      firstName: 'Client',
      lastName: 'Y',
      email: 'client@test.com',
      password: 'password123',
      confirm_password: 'password123',
      phoneNumber: '222',
      role: UserRole.CUSTOMER,
    });

    const login = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'client@test.com', password: 'password123' });
    customerToken = login.body.auth.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should enforce maxBookings capacity (prevent overbooking)', async () => {
    const startTime = new Date(2030, 4, 2, 10, 0); // May 2, 2030, 10:00 AM (Thursday)
const endTime = new Date(2030, 4, 2, 12, 0); // 12:00 PM

    const payload = {
      serviceId: testService.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    // 1. First booking succeeds
    await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload)
      .expect(201);

    // 2. Second booking at same time fails (maxBookings: 1)
    const res = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload)
      .expect(409);

    expect(res.body.message).toContain('not available');
  });

  it('should calculate price correctly for perHour pricing models', async () => {
    // Create a perHour service
    const hourlyService = await serviceRepo.save(
      serviceRepo.create({
        name: 'Hourly Work',
        business: (await bizRepo.find())[0],
        isActive: true,
        pricingModel: PricingModel.PER_HOUR,
        pricePerHour: 50,
        availability: {
          maxBookingsPerSlot: 1,
          schedule: [
            { day: 'MONDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'TUESDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'WEDNESDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'THURSDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'FRIDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'SATURDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'SUNDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
          ],
        },
      }),
    );

    const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    while(start.getDay() === 0 || start.getDay() === 6) { start.setDate(start.getDate() + 1); }
    start.setHours(14, 0, 0, 0);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

    const booking = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        serviceId: hourlyService.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      })
      .expect(201);

    // Verify amount via initiatePayment
    const payment = await request(app.getHttpServer())
      .post('/bookings/initiate-payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ bookingId: booking.body.id, paymentProvider: 'stripe' })
      .expect(201);

    // 50 * 4 hours = 200
    expect(payment.body.amount).toBe(200);
  });
});
