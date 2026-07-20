import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { HashService } from '../../common/hash/hash.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { ActivityTimerModule } from '../activity-timer/activity-timer.module';
import { SsoModule } from '../sso/sso.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRY_TIMEFRAME') as any,
        },
      }),
    }),
    TypeOrmModule.forFeature([User, RevokedToken]),
    UsersModule,
    EmailModule,
    ActivityTimerModule,
    forwardRef(() => SsoModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, HashService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
