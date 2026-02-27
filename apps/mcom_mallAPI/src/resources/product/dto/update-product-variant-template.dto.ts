import { PartialType } from '@nestjs/swagger';
import { CreateProductVariantTemplateDto } from './create-product-variant-template.dto';

export class UpdateProductVariantTemplateDto extends PartialType(
  CreateProductVariantTemplateDto,
) {}
