import { Module, forwardRef } from '@nestjs/common';
import { CapabilityService } from './capability.service';
import { MembershipModule } from '../membership/membership.module';
import { ListingsModule } from '../listings/listings.module';
import { ProductModule } from '../product/product.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    forwardRef(() => MembershipModule),
    forwardRef(() => ListingsModule),
    forwardRef(() => ProductModule),
    forwardRef(() => ServicesModule),
  ],
  providers: [CapabilityService],
  exports: [CapabilityService],
})
export class CapabilityModule {}
