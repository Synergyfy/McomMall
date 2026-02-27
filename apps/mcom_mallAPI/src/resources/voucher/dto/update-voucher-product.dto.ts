import { PartialType } from '@nestjs/swagger';
import { CreateVoucherProductDto } from './create-voucher-product.dto';

export class UpdateVoucherProductDto extends PartialType(
  CreateVoucherProductDto,
) {}
