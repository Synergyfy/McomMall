import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';
import { Coupon } from '../coupon/entities/coupon.entity';
import { UserVoucher } from '../money-engine/entities/user-voucher.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, UserVoucher, Voucher, GiftCard]),
  ],
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
  exports: [InstrumentsService],
})
export class InstrumentsModule {}
