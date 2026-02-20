import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherConsumerController } from './voucher-consumer.controller';
import { VoucherBusinessController } from './voucher-business.controller';
import { VoucherAdminController } from './voucher-admin.controller';
import { SystemVoucherController } from './system-voucher.controller';
import { Voucher } from './entities/voucher.entity';
import { VoucherProduct } from './entities/voucher-product.entity';
import { VoucherTransaction } from './entities/voucher-transaction.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { OrderPayment } from '../order/entities/order-payment.entity';
import { VoucherService } from './voucher.service';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentsModule } from '../payments/payments.module';
import { DigitalValueModule } from '../digital-value/digital-value.module';

@Module({
  imports: [
    DigitalValueModule,
    TypeOrmModule.forFeature([
      Voucher,
      VoucherProduct,
      VoucherTransaction,
      Business,
      User,
      Order,
      OrderPayment,
    ]),
    forwardRef(() => WalletModule),
    PaymentsModule,
  ],
  controllers: [
    VoucherConsumerController,
    VoucherBusinessController,
    VoucherAdminController,
    SystemVoucherController,
  ],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule { }
