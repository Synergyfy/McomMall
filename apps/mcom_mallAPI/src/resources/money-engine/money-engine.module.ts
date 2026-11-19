import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyEngineService } from './money-engine.service';
import { MoneyEngineController } from './money-engine.controller';
import { VoucherExpiryService } from './voucher-expiry.service';
import { RewardDefinition } from './entities/reward-definition.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { VoucherTransaction } from './entities/voucher-transaction.entity';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentHistory } from '../payments/entities/payment-history.entity';
import { DigitalValueModule } from '../digital-value/digital-value.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardDefinition,
      UserVoucher,
      VoucherTransaction,
      PaymentHistory,
    ]),
    PaymentsModule,
    DigitalValueModule,
  ],
  controllers: [MoneyEngineController],
  providers: [MoneyEngineService, VoucherExpiryService],
  exports: [MoneyEngineService],
})
export class MoneyEngineModule {}
