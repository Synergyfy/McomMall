import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashService } from '../../common/hash/hash.service';
import { createTokenInterface } from '../../common/types/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
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
