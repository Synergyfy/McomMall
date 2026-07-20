import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';
import { McomCentralService } from './mcom-central.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
    forwardRef(() => UsersModule),
  ],
  controllers: [SsoController],
  providers: [SsoService, McomCentralService],
  exports: [McomCentralService],
})
export class SsoModule {}
