import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/resources/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../src/common/role.enum';

describe('Email (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue(mockMailerService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('should send a welcome email to a new user', async () => {
    const timestamp = Date.now();
    const createUserDto = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${timestamp}@example.com`,
      password: 'password',
      confirm_password: 'password',
      phoneNumber: `07${timestamp.toString().slice(-9)}`,
    };

    // Mock the user creation
    const user = new User();
    user.id = '1';
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.email = createUserDto.email;
    user.role = UserRole.CUSTOMER;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(userRepository, 'save').mockResolvedValue(user);

    await request(app.getHttpServer())
      .post('/users/create')
      .send(createUserDto)
      .expect(201);

    expect(mockMailerService.sendMail).toHaveBeenCalledWith({
      to: createUserDto.email,
      subject: 'Welcome to McomMall!',
      template: './welcome',
      context: {
        name: createUserDto.firstName,
      },
    });
  });
});
