import { IsArray, IsString } from 'class-validator';

export class ValidateCouponDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsString()
  couponCode: string;
}
