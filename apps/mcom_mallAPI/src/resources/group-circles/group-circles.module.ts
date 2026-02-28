import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupCirclesService } from './group-circles.service';
import { GroupCirclesController } from './group-circles.controller';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupWallet } from './entities/group-wallet.entity';
import { GroupTransaction } from './entities/group-transaction.entity';
import { GroupCircleMessage } from './entities/group-circle-message.entity';
import { PaymentsModule } from '../payments/payments.module';
import { CapabilityModule } from '../capability/capability.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      GroupMember,
      GroupWallet,
      GroupTransaction,
      GroupCircleMessage,
    ]),
    PaymentsModule,
    CapabilityModule,
    UsersModule,
  ],
  controllers: [GroupCirclesController],
  providers: [GroupCirclesService],
  exports: [GroupCirclesService],
})
export class GroupCirclesModule {}
