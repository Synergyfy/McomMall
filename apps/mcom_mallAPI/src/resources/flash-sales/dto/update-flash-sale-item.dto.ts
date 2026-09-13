import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashSaleItemDto } from './create-flash-sale-item.dto';

export class UpdateFlashSaleItemDto extends PartialType(
  CreateFlashSaleItemDto,
) {}
