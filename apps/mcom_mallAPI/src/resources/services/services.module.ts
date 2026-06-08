import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { BundledService } from './entities/bundled-service.entity';
import { ConfigurableAddon } from './entities/configurable-addon.entity';
import { SpareCapacityOffer } from './entities/spare-capacity-offer.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { ActivitiesModule } from '../activities/activities.module';
import { CapabilityModule } from '../capability/capability.module';

@Module({
  imports: [
    forwardRef(() => CapabilityModule),
    TypeOrmModule.forFeature([
      Service,
      BundledService,
      ConfigurableAddon,
      SpareCapacityOffer,
      Business,
      User,
    ]),
    ActivitiesModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
