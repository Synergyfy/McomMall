import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyEngineService } from './money-engine.service';
import { MoneyEngineController } from './money-engine.controller';
import { RewardDefinition } from './entities/reward-definition.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { VoucherTransaction } from './entities/voucher-transaction.entity';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentHistory } from '../payments/entities/payment-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardDefinition,
      UserVoucher,
      VoucherTransaction,
      PaymentHistory,
    ]),
    PaymentsModule,
  ],
  controllers: [MoneyEngineController],
  providers: [MoneyEngineService],
  exports: [MoneyEngineService],
})
export class MoneyEngineModule {}
