import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceProviderProfile } from './entities/service-provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { ServiceProviderProfileService } from './service-provider-profile.service';
import { ServiceProviderProfileController } from './service-provider-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceProviderProfile, User])],
  providers: [ServiceProviderProfileService],
  controllers: [ServiceProviderProfileController],
  exports: [ServiceProviderProfileService],
})
export class ServiceProviderProfileModule {}
