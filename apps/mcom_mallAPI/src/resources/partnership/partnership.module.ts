import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partnership } from './entities/partnership.entity';
import { PartnershipRequest } from './entities/partnership-request.entity';
import { PartnershipService } from './partnership.service';
import { PartnershipController } from './partnership.controller';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { ProductModule } from '../product/product.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partnership, PartnershipRequest, Product, Service]),
    forwardRef(() => ProductModule),
    forwardRef(() => ServicesModule),
  ],
  controllers: [PartnershipController],
  providers: [PartnershipService],
  exports: [PartnershipService],
})
export class PartnershipModule {}