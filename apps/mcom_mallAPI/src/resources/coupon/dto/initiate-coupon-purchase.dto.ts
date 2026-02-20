import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class InitiateCouponPurchaseDto {
  @IsString()
  @IsNotEmpty()
  couponProductId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}