import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponProductDto } from './create-coupon-product.dto';

export class UpdateCouponProductDto extends PartialType(
  CreateCouponProductDto,
) {}
