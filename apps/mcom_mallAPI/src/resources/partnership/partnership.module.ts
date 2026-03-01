import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partnership } from './entities/partnership.entity';
import { PartnershipRequest } from './entities/partnership-request.entity';
import { UserPartnership } from './entities/user-partnership.entity';
import { UserPartnershipRequest } from './entities/user-partnership-request.entity';
import { ItemPartnershipRequest } from './entities/item-partnership-request.entity';
import { PartnershipService } from './partnership.service';
import { PartnershipController } from './partnership.controller';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { ProductModule } from '../product/product.module';
import { ServicesModule } from '../services/services.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partnership,
      PartnershipRequest,
      UserPartnership,
      UserPartnershipRequest,
      ItemPartnershipRequest,
      Product,
      Service,
      User,
    ]),
    forwardRef(() => ProductModule),
    forwardRef(() => ServicesModule),
    forwardRef(() => UsersModule),
    EmailModule,
  ],
  controllers: [PartnershipController],
  providers: [PartnershipService],
  exports: [PartnershipService],
})
export class PartnershipModule {}
