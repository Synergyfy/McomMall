import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/resources/users/entities/user.entity';
import { Business } from '../src/resources/listings/entities/listing.entity';
import { Product } from '../src/resources/product/entities/product.entity';
import { ShippingAddress } from '../src/resources/shipping-address/entities/shipping-address.entity';
import { UserRole } from '../src/common/role.enum';
import {
  ListingType,
  BusinessStatus,
} from '../src/resources/listings/listing.enum';
import { Order } from '../src/resources/order/entities/order.entity';
import { RoyalMailService } from '../src/resources/shipping/royal-mail.service';
import { ShippingStatus } from '../src/resources/shipping/enums/shipping-status.enum';

interface LoginResponse {
  auth: {
    accessToken: string;
  };
}

interface CheckoutResponse {
  id: string;
}

describe('Shipping (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtToken: string;
  let user: User;
  let business: Business;
  let product: Product;
  let shippingAddress: ShippingAddress;

  const mockRoyalMailService = {
    createShipment: jest.fn().mockResolvedValue({
      shipmentId: 'rm_shipment_123',
      trackingNumber: 'RM123456789GB',
    }),
    getLabel: jest.fn().mockResolvedValue('mock_base64_label_data'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RoyalMailService)
      .useValue(mockRoyalMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = app.get(DataSource);

    // Setup Test Data
    const userRepository = dataSource.getRepository(User);
    const businessRepository = dataSource.getRepository(Business);
    const productRepository = dataSource.getRepository(Product);
    const shippingAddressRepository = dataSource.getRepository(ShippingAddress);

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create User
    user = userRepository.create({
      firstName: 'Test',
      lastName: 'Customer',
      email: `test-shipping-${Date.now()}@example.com`,
      password: hashedPassword,
      phoneNumber: `07000000001`,
      role: UserRole.CUSTOMER,
      isActive: true,
      isEmailVerified: true,
    });
    await userRepository.save(user);

    // Create Business
    const owner = userRepository.create({
      firstName: 'Test',
      lastName: 'Owner',
      email: `owner-shipping-${Date.now()}@example.com`,
      password: hashedPassword,
      phoneNumber: `07000000002`,
      role: UserRole.OWNER,
      isActive: true,
    });
    await userRepository.save(owner);

    business = businessRepository.create({
      businessName: 'Test Shipping Store',
      businessEmail: 'store@example.com',
      businessPhone: '+447000000000',
      shortDescription: 'A test store for shipping integration.',
      listingType: [ListingType.PRODUCT],
      status: BusinessStatus.PUBLISHED,
      user: owner,
      location: {
        addressLine1: '123 Business St',
        city: 'London',
        postcode: 'EC1A 1BB',
        countryCode: 'GB',
      } as any,
    });
    await businessRepository.save(business);

    // Create Product
    product = productRepository.create({
      title: 'Test Shipping Product',
      description: 'A test product for shipping integration.',
      price: 10.0,
      sku: `SKU-${Date.now()}`,
      weight: 500,
      business: business,
      category: 'Test',
      productType: 'physical',
    });
    await productRepository.save(product);

    // Create Shipping Address
    shippingAddress = shippingAddressRepository.create({
      addressName: 'Home',
      recipientName: 'John Doe',
      phoneNumber: '07123456789',
      addressLine1: '456 Customer Rd',
      city: 'Manchester',
      state: 'Greater Manchester',
      country: 'UK',
      postalCode: 'M1 1AA',
      user: user,
    });
    await shippingAddressRepository.save(shippingAddress);

    // Login to get Token
    const loginRes = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: user.email, password: 'Password123!' });

    const body = loginRes.body as LoginResponse;
    jwtToken = body.auth.accessToken;
  });

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
  });

  it('/order/checkout (POST) - should initiate checkout with Royal Mail shipping', async () => {
    const checkoutDto = {
      directPurchase: {
        productId: product.id,
        quantity: 1,
      },
      shippingAddressId: shippingAddress.id,
      carrierCode: 'royalmail',
      payment: {
        amount: 14.5, // 10.00 product + 4.50 shipping
        paymentMethod: 'stripe',
        transactionId: 'test-tx-123',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/order/checkout')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(checkoutDto);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');

    const body = response.body as CheckoutResponse;
    const order = await dataSource.getRepository(Order).findOne({
      where: { id: body.id },
      relations: ['shippingAddress'],
    });

    if (!order) throw new Error('Order not found');

    expect(order.carrierCode).toBe('royalmail');
    expect(Number(order.estimatedShippingFee)).toBe(4.5);
    expect(order.shippingAddress.id).toBe(shippingAddress.id);
    expect(Number(order.total)).toBe(14.5);
  });

  it('/shipping/generate-label/:orderId (POST) - should generate Royal Mail label', async () => {
    // 1. Create a paid order
    const checkoutDto = {
      directPurchase: {
        productId: product.id,
        quantity: 1,
      },
      shippingAddressId: shippingAddress.id,
      carrierCode: 'royalmail',
      payment: {
        amount: 14.5,
        paymentMethod: 'stripe',
        transactionId: 'tx-for-label',
      },
    };

    const checkoutRes = await request(app.getHttpServer())
      .post('/order/checkout')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(checkoutDto);

    const checkoutBody = checkoutRes.body as CheckoutResponse;
    const orderId = checkoutBody.id;

    // 2. Generate Label
    const response = await request(app.getHttpServer())
      .post(`/shipping/generate-label/${orderId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send();

    expect(response.status).toBe(201);

    // 3. Verify Order Updates
    const order = await dataSource.getRepository(Order).findOne({
      where: { id: orderId },
    });

    if (!order) throw new Error('Order not found');

    expect(order.shippingStatus).toBe(ShippingStatus.LABEL_GENERATED);
    expect(order.trackingNumber).toBe('RM123456789GB');
    expect(order.royalMailShipmentId).toBe('rm_shipment_123');
    expect(order.royalMailLabelData).toBe('mock_base64_label_data');
    expect(order.labelUrl).toContain('rm_shipment_123');

    expect(mockRoyalMailService.createShipment).toHaveBeenCalled();
    expect(mockRoyalMailService.getLabel).toHaveBeenCalledWith(
      'rm_shipment_123',
    );
  });
});
