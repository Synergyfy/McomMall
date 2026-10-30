import { AuthService } from './auth.service';
import { UserRole } from '../../common/role.enum';

describe('AuthService - SSO identity sync', () => {
  let service: AuthService;
  let userRepository: any;
  let userService: any;
  let jwtService: any;
  let dataSource: any;
  let businessRepository: any;

  const basePayload = {
    iss: 'mcom-central',
    aud: 'mcom-mall',
    sub: 'central-user-1',
    email: 'owner@store.com',
    role: 'BUSINESS',
    profileType: 'BUSINESS',
    name: 'Acme Ltd',
    firstName: 'Alice',
    lastName: 'Smith',
    fullName: 'Alice Smith',
    phone: '+44 20 1234 5678',
    address: '1 High Street, London',
    postcode: 'EC1A 1BB',
    country: 'United Kingdom',
    jobTitle: 'Managing Director',
    avatarUrl: 'https://cdn.mcom.com/logo.png',
    businessId: 'biz_central_1',
    businessName: 'Acme Ltd',
    isAffiliate: false,
    businessProfile: {
      id: 'biz_central_1',
      businessName: 'Acme Ltd',
      businessType: 'Limited Company',
      phone: '+44 20 1234 5678',
      email: 'hello@acme.co.uk',
      address: '1 High Street, London',
      postcode: 'EC1A 1BB',
      country: 'United Kingdom',
      industry: 'Food & Beverage',
      category: 'Coffee Shop',
      subCategory: 'Cafe',
      description: 'Speciality coffee roastery in central London.',
      website: 'https://acme.co.uk',
      logoUrl: 'https://cdn.mcom.com/logo.png',
      openingHours: 'Mon-Sat 8am-6pm',
      socialMedia: '{"instagram":"https://instagram.com/acme"}',
    },
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    userRepository = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    };

    userService = {
      create: jest.fn(),
      findOrCreateFromCentralIdentity: jest
        .fn()
        .mockImplementation(() => userRepository.findOne({ where: {} })),
    };

    jwtService = {
      verify: jest.fn().mockReturnValue(basePayload),
      sign: jest
        .fn()
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token'),
    };

    businessRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockImplementation((value) => value),
      save: jest
        .fn()
        .mockImplementation((value) =>
          Promise.resolve({ id: 'biz-2', ...value }),
        ),
    };

    dataSource = {
      getRepository: jest.fn().mockReturnValue(businessRepository),
    };

    service = new AuthService(
      userRepository,
      {} as any,
      {} as any,
      jwtService,
      userService,
      dataSource,
    );

    // JIT provisioning calls postcodes.io; keep the unit test offline.
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false });
  });

  it('syncs the full central identity and business profile on login', async () => {
    const user = {
      id: 'user-1',
      email: 'owner@store.com',
      firstName: 'Old',
      lastName: 'Name',
      phoneNumber: '+44 0000 000000',
      role: UserRole.OWNER,
      centralUserId: 'central-user-1',
    };
    userRepository.findOne.mockImplementation(({ where }: any) => {
      if (where?.email) return Promise.resolve(null);
      if (where?.phoneNumber) return Promise.resolve(null);
      return Promise.resolve(user);
    });
    businessRepository.findOne.mockResolvedValue({
      id: 'biz-1',
      businessName: 'Old Biz',
      businessPhone: '+44 0000 000000',
      businessEmail: 'old@acme.co.uk',
      location: { id: 'loc-1', addressLine1: 'Old', postcode: 'OLD 1' },
    });

    const result = await service.loginWithSso('sso-token');

    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        firstName: 'Alice',
        lastName: 'Smith',
        fullName: 'Alice Smith',
        phoneNumber: '+44 20 1234 5678',
        jobTitle: 'Managing Director',
        address: '1 High Street, London',
        postcode: 'EC1A 1BB',
        country: 'United Kingdom',
        profilePictureUrl: 'https://cdn.mcom.com/logo.png',
      }),
    );
    expect(businessRepository.update).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({
        businessName: 'Acme Ltd',
        businessPhone: '+44 20 1234 5678',
        businessEmail: 'hello@acme.co.uk',
        website: 'https://acme.co.uk',
        businessType: 'Limited Company',
        industry: 'Food & Beverage',
        centralCategory: 'Coffee Shop',
        centralSubCategory: 'Cafe',
        openingHours: 'Mon-Sat 8am-6pm',
      }),
    );
    expect(result.accessToken).toBe('access-token');
    expect(result.centralUserId).toBe('central-user-1');
  });

  it('creates a new business user with explicit names and provisions the storefront', async () => {
    userRepository.findOne.mockResolvedValue(null);
    businessRepository.findOne.mockResolvedValue(null);
    userService.findOrCreateFromCentralIdentity.mockResolvedValue({
      id: 'user-2',
      email: 'owner@store.com',
      firstName: 'Alice',
      lastName: 'Smith',
      role: UserRole.OWNER,
      phoneNumber: '+44 20 1234 5678',
    });

    await service.loginWithSso('sso-token');

    expect(userService.findOrCreateFromCentralIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'owner@store.com',
        firstName: 'Alice',
        lastName: 'Smith',
        role: UserRole.OWNER,
      }),
    );
    expect(businessRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        businessName: 'Acme Ltd',
        businessType: 'Limited Company',
        industry: 'Food & Beverage',
        centralCategory: 'Coffee Shop',
        centralSubCategory: 'Cafe',
        website: 'https://acme.co.uk',
        logoUrl: 'https://cdn.mcom.com/logo.png',
      }),
    );
  });

  it('does not overwrite local names from a legacy token without explicit claims', async () => {
    jwtService.verify.mockReturnValue({
      iss: 'mcom-central',
      aud: 'mcom-mall',
      sub: 'central-user-1',
      email: 'owner@store.com',
      role: 'business',
      name: 'Acme Ltd',
    });

    const user = {
      id: 'user-1',
      email: 'owner@store.com',
      firstName: 'Alice',
      lastName: 'Smith',
      role: UserRole.OWNER,
      centralUserId: 'central-user-1',
    };
    userRepository.findOne.mockResolvedValue(user);
    businessRepository.findOne.mockResolvedValue({
      id: 'biz-1',
      businessName: 'Acme Ltd',
    });

    await service.loginWithSso('sso-token');

    const userUpdate = userRepository.update.mock.calls[0]?.[1] ?? {};
    expect(userUpdate.firstName).toBeUndefined();
    expect(userUpdate.lastName).toBeUndefined();
    expect(businessRepository.update).not.toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({ businessName: 'Acme Ltd' }),
    );
  });

  it('syncs customer contact details without creating a business', async () => {
    jwtService.verify.mockReturnValue({
      iss: 'mcom-central',
      aud: 'mcom-mall',
      sub: 'central-customer-1',
      email: 'shopper@example.com',
      role: 'CUSTOMER',
      profileType: 'CUSTOMER',
      name: 'Sam Lee',
      firstName: 'Sam',
      lastName: 'Lee',
      fullName: 'Sam Lee',
      phone: '+44 7700 900999',
      jobTitle: null,
      address: null,
      postcode: null,
      country: null,
      customerProfile: {
        id: 'cust_1',
        phone: '+44 7700 900999',
        loyaltyPoints: 120,
        membershipStatus: 'None',
        status: 'Active',
      },
    });

    const user = {
      id: 'customer-1',
      email: 'shopper@example.com',
      firstName: 'Sam',
      lastName: 'Lee',
      phoneNumber: '+44 0000 000000',
      role: UserRole.CUSTOMER,
      centralUserId: 'central-customer-1',
    };
    userRepository.findOne.mockResolvedValue(user);

    await service.loginWithSso('sso-token');

    expect(userRepository.update).toHaveBeenCalledWith(
      'customer-1',
      expect.objectContaining({
        phoneNumber: '+44 7700 900999',
        centralProfile: expect.objectContaining({
          profileType: 'CUSTOMER',
          customerProfile: expect.objectContaining({ loyaltyPoints: 120 }),
        }),
      }),
    );
    expect(businessRepository.findOne).not.toHaveBeenCalled();
  });
});
