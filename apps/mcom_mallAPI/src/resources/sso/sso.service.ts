import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { createTokenInterface } from '../../common/types/auth.interface';
import { UserRole } from '../../common/role.enum';
import { Business } from '../listings/entities/listing.entity';
import { Location } from '../listings/entities/location.entity';
import { ListingType, BusinessStatus } from '../listings/listing.enum';
import { LocalMall } from '../localmall/entities/localmall.entity';
import { ActivatedRegion } from '../localmall/entities/activated-region.entity';
import * as crypto from 'crypto';

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  getAuthorizeUrl(state: string): string {
    const baseUrl =
      process.env.MCOM_CENTRAL_BASE_URL || 'http://localhost:3010';
    const clientId = process.env.SSO_CLIENT_ID || 'mcom-mall';
    const frontendUrl =
      process.env.MALL_FRONTEND_URL || 'http://localhost:3002';
    const redirectUri = `${frontendUrl}/auth/sso`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    return `${baseUrl}/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    const baseUrl =
      process.env.MCOM_CENTRAL_BASE_URL || 'http://localhost:3010';
    const frontendUrl =
      process.env.MALL_FRONTEND_URL || 'http://localhost:3002';
    const redirectUri = `${frontendUrl}/auth/sso`;

    const response = await fetch(`${baseUrl}/api/v1/auth/sso/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SSO_CLIENT_ID,
        client_secret: process.env.SSO_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      this.logger.error(`Token exchange failed: ${response.status}`, errorBody);
      throw new UnauthorizedException(
        errorBody.error || 'SSO token exchange failed',
      );
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      throw new UnauthorizedException(
        'Invalid response from MCOM Central token endpoint',
      );
    }
    return data;
  }

  async handleCallback(code: string, state: string, cookieState: string) {
    if (!state || !cookieState || state !== cookieState) {
      throw new UnauthorizedException('CSRF State mismatch');
    }

    const tokenData = await this.exchangeCode(code);
    const centralUser = tokenData.user;

    if (!centralUser || !centralUser.email) {
      throw new UnauthorizedException(
        'Invalid user data received from MCOM Central',
      );
    }

    let localUser = await this.userRepository.findOne({
      where: { email: centralUser.email },
    });

    if (!localUser) {
      const role = centralUser.role?.toLowerCase();
      const password = Math.random().toString(36).slice(-10) + 'Aa1!';
      const fullName = centralUser.name || centralUser.email.split('@')[0];
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'User';

      localUser = await this.userService.create({
        email: centralUser.email,
        firstName,
        lastName,
        password,
        confirm_password: password,
        phoneNumber:
          centralUser.phoneNumber ||
          `00000000${Math.floor(1000 + Math.random() * 9000)}`,
        role: role === 'business' ? UserRole.OWNER : UserRole.CUSTOMER,
      });
    } else {
      const newName =
        centralUser.name || `${localUser.firstName} ${localUser.lastName}`;
      const nameParts = newName.split(' ');
      const newFirstName = nameParts[0] || localUser.firstName;
      const newLastName = nameParts.slice(1).join(' ') || localUser.lastName;

      const centralRole = centralUser.role?.toLowerCase();
      const newRole =
        centralRole === 'business' ? UserRole.OWNER : UserRole.CUSTOMER;

      const needsUpdate =
        localUser.firstName !== newFirstName ||
        localUser.lastName !== newLastName ||
        localUser.role !== newRole;

      if (needsUpdate) {
        localUser.firstName = newFirstName;
        localUser.lastName = newLastName;
        localUser.fullName = `${newFirstName} ${newLastName}`;
        localUser.role = newRole;
        await this.userRepository.save(localUser);
      }
    }

    if (localUser.role === UserRole.OWNER) {
      await this.jitStorefrontSync(localUser, centralUser);
    }

    const tokenPayload: createTokenInterface = {
      sub: localUser.id,
      role: localUser.role,
      email: localUser.email,
      name: `${localUser.firstName} ${localUser.lastName}`,
      userId: localUser.id,
    };

    const tokens = this.createToken(tokenPayload);

    return {
      ...tokens,
      userId: localUser.id,
      name: `${localUser.firstName} ${localUser.lastName}`,
      role: localUser.role,
    };
  }

  private async jitStorefrontSync(localUser: User, centralUser: any) {
    const businessRepository = this.dataSource.getRepository(Business);
    const existingBusiness = await businessRepository.findOne({
      where: { user: { id: localUser.id } },
    });

    if (existingBusiness) return;

    const locationRepository = this.dataSource.getRepository(Location);
    const cleanPostcode = (centralUser.postcode || 'SW1A 1AA')
      .trim()
      .toUpperCase();
    const address = centralUser.address || 'High Street';

    let lat = 51.5074;
    let lon = -0.1278;
    let borough = 'London';

    try {
      const postcodeResponse = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(
          cleanPostcode.replace(/\s+/g, ''),
        )}`,
      );
      if (postcodeResponse.ok) {
        const body = await postcodeResponse.json();
        if (body && body.status === 200 && body.result) {
          lat = body.result.latitude;
          lon = body.result.longitude;
          const rawBorough =
            body.result.admin_district || body.result.region || '';
          borough = rawBorough
            .replace(/London Borough of /i, '')
            .replace(/Borough of /i, '')
            .replace(/City of /i, '')
            .replace(/Royal Borough of /i, '')
            .trim();
        }
      }
    } catch (err) {
      this.logger.error('Postcodes.io lookup error in JIT:', err);
    }

    const mallName = `${borough} Local Mall`;
    const localMallRepository = this.dataSource.getRepository(LocalMall);
    let localMall = await localMallRepository.findOne({
      where: { name: mallName },
    });

    if (!localMall) {
      localMall = localMallRepository.create({
        name: mallName,
        latitude: lat,
        longitude: lon,
      });
      await localMallRepository.save(localMall);
    }

    const activatedRegionRepository =
      this.dataSource.getRepository(ActivatedRegion);
    let activeRegion = await activatedRegionRepository.findOne({
      where: { name: borough },
    });
    if (!activeRegion) {
      activeRegion = activatedRegionRepository.create({
        name: borough,
        isActive: true,
      });
      await activatedRegionRepository.save(activeRegion);
    } else if (!activeRegion.isActive) {
      activeRegion.isActive = true;
      await activatedRegionRepository.save(activeRegion);
    }

    const newBusiness = businessRepository.create({
      user: localUser,
      businessName: centralUser.name || 'Hyperlocal Merchant',
      businessPhone: centralUser.phoneNumber || '0000000000',
      businessEmail: localUser.email,
      shortDescription:
        'Hyperlocal business listing imported from MCOM Ecosystem.',
      listingType: [ListingType.PRODUCT, ListingType.SERVICE],
      status: BusinessStatus.PUBLISHED,
      isVerified: true,
      isGoogleVerified: true,
      localMall,
    });

    const savedBusiness = await businessRepository.save(newBusiness);

    const newLocation = locationRepository.create({
      business: savedBusiness,
      postcode: cleanPostcode,
      addressLine1: address,
      city: borough,
      countryCode: 'GB',
      showPublicly: true,
    });

    await locationRepository.save(newLocation);
    this.logger.log(
      `[SSO JIT] Provisioned business listing for ${localUser.email}`,
    );
  }

  private createToken(payload: createTokenInterface) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30m' as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d' as any,
    });
    return { accessToken, refreshToken };
  }
}
