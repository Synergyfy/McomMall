import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearDatabase } from './test-utils';
import { CreateCouponDto } from '../src/resources/coupon/dto/create-coupon.dto';
import {
  DiscountType,
  CouponSourceType,
} from '../src/resources/coupon/coupon.enum';
import { UsersService } from '../src/resources/users/users.service';
import { CreateUserDto } from '../src/resources/users/dto/create-user.dto';
import { UserRole } from '../src/common/role.enum';

describe('CouponController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue({ sendMail: jest.fn().mockResolvedValue({}) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await clearDatabase(app);

    const usersService = app.get(UsersService);
    const email = `test-${Date.now()}@test.com`;
    const password = 'password123';
    const createUserDto: CreateUserDto = {
      firstName: 'Test',
      lastName: 'User',
      email,
      password,
      confirm_password: password,
      phoneNumber: '1234567890',
      role: UserRole.OWNER,
    };
    await usersService.create(createUserDto);

    const response = await request(app.getHttpServer())
      .post('/auth')
      .send({ email, password })
      .expect(201);

    jwtToken = response.body.auth.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a coupon', async () => {
    const createCouponDto: CreateCouponDto = {
      title: 'New Sale',
      code: 'SALE20',
      sourceType: CouponSourceType.PLATFORM,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
    };

    const response = await request(app.getHttpServer())
      .post('/coupons')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createCouponDto)
      .expect(201);

    expect(response.body).toHaveProperty('code'); // Expect ANY code
  });
});
