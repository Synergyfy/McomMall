import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalValueService } from './digital-value.service';
import { DigitalValue } from './entities/digital-value.entity';
import { DigitalValueTransaction } from './entities/digital-value-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DigitalValue,
      DigitalValueTransaction,
      User,
      Business,
      Order,
    ]),
  ],
  controllers: [],
  providers: [DigitalValueService],
  exports: [DigitalValueService],
})
export class DigitalValueModule {}
