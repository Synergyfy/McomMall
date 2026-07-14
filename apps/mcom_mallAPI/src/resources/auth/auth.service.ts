import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { HashService } from '../../common/hash/hash.service';
import { createTokenInterface } from '../../common/types/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/role.enum';
import { Business } from '../listings/entities/listing.entity';
import { Location } from '../listings/entities/location.entity';
import { ListingType, BusinessStatus } from '../listings/listing.enum';
import { LocalMall } from '../localmall/entities/localmall.entity';
import { ActivatedRegion } from '../localmall/entities/activated-region.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async comparePassword(password: string, email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
    const isPasswordCorrect = await this.hashService.comparePassword(
      password,
      user.password,
    );
    return isPasswordCorrect;
  }

  createToken(
    payload: createTokenInterface,
    accessTokenExpiry?: string,
    refreshTokenExpiry?: string,
  ) {
    if (payload) {
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: (accessTokenExpiry || '30m') as any,
      });

      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: (refreshTokenExpiry || '7d') as any,
      });

      return {
        accessToken,
        refreshToken,
      };
    }
  }

  async createLogin(payload: createTokenInterface) {
    return this.createToken({ ...payload });
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.userService.findCurrentUser(payload.email);

      if (!user) {
        throw new Error('User not found');
      }

      const { id, role, firstName, lastName, email } = user;
      const name = `${firstName} ${lastName}`;

      // Create new token payload
      const tokenPayload: createTokenInterface = {
        sub: id,
        role,
        email,
        name,
        userId: id,
      };

      const newAccessToken = this.jwtService.sign(tokenPayload, {
        expiresIn: '30m' as any,
      });
      const newRefreshToken = this.jwtService.sign(tokenPayload, {
        expiresIn: '7d' as any,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        package: null,
        userId: id,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async loginWithSso(ssoToken: string) {
    try {
      const secret = process.env.SSO_SECRET || 'shared-sso-secret';
      const payload = this.jwtService.verify(ssoToken, { secret });

      if (payload.iss !== 'mcom-loyalty' || payload.aud !== 'mcom-mall') {
        throw new Error('Invalid SSO Token Issuer/Audience');
      }

      const email = payload.email;
      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        // Create User using transaction to ensure wallet and trial are created
        const role = payload.role?.toLowerCase();
        const password = Math.random().toString(36).slice(-10) + 'Aa1!';

        const fullName = payload.name || 'Loyalty User';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'User'; // Default last name if missing

        user = await this.userService.create({
          email,
          firstName,
          lastName,
          password: password,
          confirm_password: password,
          phoneNumber:
            payload.phoneNumber ||
            `00000000${Math.floor(1000 + Math.random() * 9000)}`,
          role: role === 'business' ? UserRole.OWNER : UserRole.CUSTOMER,
        });
      }

      // Check if Business listing exists for this user (JIT Storefront Sync)
      if (user.role === UserRole.OWNER) {
        const businessRepository = this.dataSource.getRepository(Business);
        const existingBusiness = await businessRepository.findOne({
          where: { user: { id: user.id } },
        });

        if (!existingBusiness) {
          const locationRepository = this.dataSource.getRepository(Location);
          const cleanPostcode = (payload.postcode || 'SW1A 1AA')
            .trim()
            .toUpperCase();
          const address = payload.address || 'High Street';

          // Resolve coordinates & borough dynamically using Postcodes.io
          let lat = 51.5074;
          let lon = -0.1278;
          let borough = 'London';

          try {
            const postcodeResponse = await fetch(
              `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode.replace(/\s+/g, ''))}`,
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
            console.error('Postcodes.io lookup error in JIT:', err);
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

          // Mark region as active so it displays on the frontend without "Peckham High Street" fallback
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
            user,
            businessName: payload.name || 'Hyperlocal Merchant',
            businessPhone: payload.phoneNumber || '0000000000',
            businessEmail: payload.email,
            shortDescription:
              'Hyperlocal business listing imported from MCOM Ecosystem.',
            listingType: [ListingType.PRODUCT, ListingType.SERVICE],
            status: BusinessStatus.PUBLISHED,
            isVerified: true,
            isGoogleVerified: true,
            localMall, // Link Business listing to its local mall!
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
          console.log(
            `[SSO JIT] Automatically provisioned business listing & location for ${user.email} with postcode ${cleanPostcode} under ${mallName}`,
          );
        }
      }

      // Generate Mall Token
      const tokenPayload: createTokenInterface = {
        sub: user.id,
        role: user.role,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        userId: user.id,
      };

      const tokens = this.createToken(tokenPayload);
      return {
        ...tokens,
        email: user.email,
      };
    } catch (error) {
      console.error('SSO Error', error);
      throw new Error('SSO Failed');
    }
  }
}
