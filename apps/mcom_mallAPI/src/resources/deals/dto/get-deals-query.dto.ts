import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { DealKind } from './deal.dto';

export const DEAL_KINDS: DealKind[] = [
  'standard_coupon',
  'coupon_voucher',
  'voucher_coupon',
  'voucher',
  'gift_card',
  'promotion',
];

export class GetDealsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(DEAL_KINDS)
  kind?: DealKind;

  @IsOptional()
  @IsString()
  search?: string;
}
