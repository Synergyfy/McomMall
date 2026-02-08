import { IsOptional, IsUUID } from 'class-validator';

export class CheckPromotionDto {
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;
}
