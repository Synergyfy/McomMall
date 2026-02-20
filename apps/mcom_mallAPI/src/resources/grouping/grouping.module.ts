import { Module, forwardRef } from '@nestjs/common';
import { GroupingService } from './grouping.service';
import { GroupingController } from './grouping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { User } from '../users/entities/user.entity';
import { GroupWallet } from './entities/group-wallet.entity';
import { GroupTransaction } from './entities/group-transaction.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { PaymentsModule } from '../payments/payments.module';
import { CapabilityModule } from '../capability/capability.module';

@Module({
  imports: [
    forwardRef(() => CapabilityModule),
    TypeOrmModule.forFeature([
      Group,
      GroupMember,
      User,
      GroupWallet,
      GroupTransaction,
      Wallet,
    ]),
    PaymentsModule,
  ],
  controllers: [GroupingController],
  providers: [GroupingService],
})
export class GroupingModule {}
