import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { Membership } from '../membership/entities/membership.entity';
import { MembershipPayment } from '../membership/entities/membership-payment.entity';
import { IntegrationSetting } from './entities/integration-setting.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { AppIntegration } from './entities/app-integration.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      User,
      Membership,
      MembershipPayment,
      IntegrationSetting,
      PaymentMethod,
      AppIntegration,
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
