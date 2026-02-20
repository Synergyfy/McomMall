import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalValueService } from './digital-value.service';
import { DigitalValueConsumerController } from './controllers/digital-value-consumer.controller';
import { DigitalValueBusinessController } from './controllers/digital-value-business.controller';
import { DigitalValueAdminController } from './controllers/digital-value-admin.controller';
import { DigitalValueMaster } from './entities/digital-value-master.entity';
import { DigitalValueTransaction } from './entities/digital-value-transaction.entity';
import { RewardLinkage } from './entities/reward-linkage.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DigitalValueMaster,
      DigitalValueTransaction,
      RewardLinkage,
      User,
      Business,
    ]),
  ],
  controllers: [
    DigitalValueConsumerController,
    DigitalValueBusinessController,
    DigitalValueAdminController,
  ],
  providers: [DigitalValueService],
  exports: [DigitalValueService],
})
export class DigitalValueModule {}
