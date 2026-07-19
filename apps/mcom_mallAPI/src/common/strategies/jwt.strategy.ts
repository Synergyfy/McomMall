import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { createTokenInterface } from '../types/auth.interface';
import { AuthService } from '../../resources/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: createTokenInterface) {
    if (payload.jti) {
      const isRevoked = await this.authService.isTokenRevoked(payload.jti);
      if (isRevoked) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      userId: payload.sub,
      centralUserId: payload.centralUserId,
    };
    return user;
  }
}
