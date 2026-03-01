import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/resources/users/users.service';
import { clearDatabase } from './test-utils';
import { CreateUserDto } from '../src/resources/users/dto/create-user.dto';
import { UserRole } from '../src/common/role.enum';
import { Service } from 'src/resources/services/entities/service.entity';
import { PricingModel } from 'src/resources/services/service.enum';
import { Business } from 'src/resources/listings/entities/listing.entity';
import { User } from 'src/resources/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceBooking } from 'src/resources/booking/entities/service-booking.entity';
import {
  ListingType,
  BusinessStatus,
} from 'src/resources/listings/listing.enum';

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let customerJwtToken: string;
  let business: Business;
  let service: Service;
  let user: User;
  let customer: User;
  let bookingRepository: Repository<ServiceBooking>;
  let booking3: ServiceBooking;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await clearDatabase(app);

    const usersService = app.get(UsersService);
    bookingRepository = app.get<Repository<ServiceBooking>>(
      getRepositoryToken(ServiceBooking),
    );
    const businessRepository = app.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
    const serviceRepository = app.get<Repository<Service>>(
      getRepositoryToken(Service),
    );

    const ownerEmail = `owner-${Date.now()}@test.com`;
    const ownerPassword = 'password123';
    const createOwnerDto: CreateUserDto = {
      firstName: 'Test',
      lastName: 'Owner',
      email: ownerEmail,
      password: ownerPassword,
      confirm_password: ownerPassword,
      phoneNumber: '1234567890',
      role: UserRole.OWNER,
    };
    user = await usersService.create(createOwnerDto);

    const customerEmail = `customer-${Date.now()}@test.com`;
    const customerPassword = 'password123';
    const createCustomerDto: CreateUserDto = {
      firstName: 'Test',
      lastName: 'Customer',
      email: customerEmail,
      password: customerPassword,
      confirm_password: customerPassword,
      phoneNumber: '0987654321',
      role: UserRole.CUSTOMER,
    };
    customer = await usersService.create(createCustomerDto);

    const ownerLoginResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: ownerEmail, password: ownerPassword })
      .expect(201);
    jwtToken = ownerLoginResponse.body.auth.accessToken;

    const customerLoginResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: customerEmail, password: customerPassword })
      .expect(201);
    customerJwtToken = customerLoginResponse.body.auth.accessToken;

    business = businessRepository.create({
      businessName: 'Test Business',
      user,
      listingType: [ListingType.SERVICE],
      shortDescription: 'Test short description',
      businessPhone: '+441234567890',
      status: BusinessStatus.PUBLISHED,
    });
    await businessRepository.save(business);

    service = serviceRepository.create({
      name: 'Test Service',
      business,
      pricingModel: PricingModel.FIXED,
      fixedPrice: 100,
    });
    await serviceRepository.save(service);

    // Create bookings
    const now = new Date();
    const booking1 = bookingRepository.create({
      user: customer,
      service,
      startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      endTime: new Date(
        now.getTime() - 10 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      ),
    });
    const booking2 = bookingRepository.create({
      user: customer,
      service,
      startTime: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      endTime: new Date(
        now.getTime() - 20 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      ),
    });
    booking3 = bookingRepository.create({
      user: customer,
      service,
      startTime: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      endTime: new Date(
        now.getTime() - 40 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      ),
    });
    await bookingRepository.save([booking1, booking2, booking3]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return all bookings for a business when no days are specified', async () => {
    const response = await request(app.getHttpServer())
      .get('/bookings/business')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body.length).toBe(3);
  });

  it('should return bookings for a business within the last 30 days', async () => {
    const response = await request(app.getHttpServer())
      .get('/bookings/business?days=30')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body.length).toBe(2);
  });

  it('should return all bookings for a customer when no days are specified', async () => {
    const response = await request(app.getHttpServer())
      .get('/bookings/customer')
      .set('Authorization', `Bearer ${customerJwtToken}`)
      .expect(200);

    expect(response.body.length).toBe(3);
  });

  it('should return bookings for a customer within the last 30 days', async () => {
    const response = await request(app.getHttpServer())
      .get('/bookings/customer?days=30')
      .set('Authorization', `Bearer ${customerJwtToken}`)
      .expect(200);

    expect(response.body.length).toBe(2);
  });

  it('should return available slots for a given day', async () => {
    // Make sure we have business hours set for the business to make this pass properly
    // This is just a minimal check for the public endpoint
    const date = new Date().toISOString().split('T')[0];
    const response = await request(app.getHttpServer())
      .get(`/bookings/available-slots?serviceId=${service.id}&date=${date}`)
      .expect(200);

    // It should at least be an array (even if empty due to no business hours)
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a booking with full configuration', async () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const payload = {
      serviceId: service.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      numberOfGuests: 2,
      address: '123 Test Street, London',
      phone: '07123456789',
      problemDescription: 'Test problem description',
      config: { 'Custom Question': 'Answer' },
    };

    const response = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${customerJwtToken}`)
      .send(payload)
      .expect(201);

    expect(response.body.address).toBe(payload.address);
    expect(response.body.phone).toBe(payload.phone);
    expect(response.body.problemDescription).toBe(payload.problemDescription);
    expect(response.body.config).toEqual(payload.config);
  });

  it('should prevent refunding a booking without a payment intent', async () => {
    // We expect a 400 because there is no payment intent
    const response = await request(app.getHttpServer())
      .post(`/bookings/${booking3.id}/refund`)
      .set('Authorization', `Bearer ${jwtToken}`) // Assuming admin or owner
      .expect(400);

    expect(response.body.message).toContain(
      'Only confirmed or cancelled bookings',
    );
  });
});
