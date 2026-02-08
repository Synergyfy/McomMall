import { IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCouponDto } from './create-coupon.dto';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

export class VerifyCouponPurchaseDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CreateCouponDto)
  purchaseDetails: CreateCouponDto;

  @IsString()
  @IsNotEmpty()
  paymentProvider: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  transactionId: string;
}