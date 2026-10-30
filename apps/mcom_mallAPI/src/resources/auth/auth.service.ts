import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { HashService } from '../../common/hash/hash.service';
import { createTokenInterface } from '../../common/types/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RevokedToken } from './entities/revoked-token.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  buildNewUserIdentity,
  syncCentralIdentity,
} from '../sso/central-profile-sync';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RevokedToken)
    private revokedTokenRepository: Repository<RevokedToken>,
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
      const accessJti = uuidv4();
      const refreshJti = uuidv4();

      const accessToken = this.jwtService.sign(
        { ...payload, jti: accessJti },
        { expiresIn: (accessTokenExpiry || '30m') as any },
      );

      const refreshToken = this.jwtService.sign(
        { ...payload, jti: refreshJti },
        { expiresIn: (refreshTokenExpiry || '7d') as any },
      );

      return {
        accessToken,
        refreshToken,
      };
    }
  }

  async createLogin(payload: createTokenInterface) {
    return this.createToken({ ...payload });
  }

  async logout(accessToken: string): Promise<{ success: boolean }> {
    try {
      const decoded = this.jwtService.decode(accessToken) as any;
      if (!decoded || !decoded.jti) {
        return { success: true };
      }

      const expiresAt = new Date(decoded.exp * 1000);

      const revoked = this.revokedTokenRepository.create({
        jti: decoded.jti,
        tokenType: 'access',
        expiresAt,
      });
      await this.revokedTokenRepository.save(revoked);

      return { success: true };
    } catch {
      return { success: true };
    }
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    const revoked = await this.revokedTokenRepository.findOne({
      where: { jti },
    });
    return !!revoked;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.userService.findCurrentUser(payload.email);

      if (!user) {
        throw new Error('User not found');
      }

      const { id, role, firstName, lastName, email, centralUserId } = user;
      const name = `${firstName} ${lastName}`;

      // Create new token payload with centralUserId preserved
      const tokenPayload: createTokenInterface = {
        sub: id,
        role,
        email,
        name,
        userId: id,
        centralUserId,
      };

      const tokens = this.createToken(tokenPayload);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
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

      if (
        (payload.iss !== 'mcom-loyalty' && payload.iss !== 'mcom-central') ||
        (payload.aud !== 'mcom-mall' && payload.aud !== 'mcom-ecosystem')
      ) {
        throw new Error('Invalid SSO Token Issuer/Audience');
      }

      const email = payload.email;
      const centralUserId = payload.sub;

      if (!centralUserId) {
        throw new Error('MCOM Solutions user ID not found in SSO token');
      }

      // Resolve by Central ID first so an email change on MCOM Central does
      // not create a duplicate local account. Provisioning is idempotent and
      // safe under concurrent SSO callbacks.
      const identity = buildNewUserIdentity(payload);

      const user = await this.userService.findOrCreateFromCentralIdentity({
        email,
        centralUserId,
        firstName: identity.firstName,
        lastName: identity.lastName,
        phoneNumber: identity.phoneNumber,
        role: identity.role,
      });

      // MCOM Central is the identity source of truth. Diff and refresh every
      // local field (person, contact, business profile, storefront) on login.
      const synced = await syncCentralIdentity({
        userRepository: this.userRepository,
        dataSource: this.dataSource,
        localUser: user,
        centralUser: payload,
        logger: this.logger,
      });
      const syncedUser = synced.user;

      // Generate Mall Token
      const tokenPayload: createTokenInterface = {
        sub: syncedUser.id,
        role: syncedUser.role,
        email: syncedUser.email,
        name: `${syncedUser.firstName} ${syncedUser.lastName}`,
        userId: syncedUser.id,
        centralUserId: centralUserId,
      };

      const tokens = this.createToken(tokenPayload);
      return {
        ...tokens,
        email: syncedUser.email,
        centralUserId: centralUserId,
      };
    } catch (error) {
      console.error('SSO Error', error);
      throw new Error('SSO Failed');
    }
  }
}
