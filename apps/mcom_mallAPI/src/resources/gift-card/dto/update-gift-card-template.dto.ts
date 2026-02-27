import { PartialType } from '@nestjs/swagger';
import { CreateGiftCardTemplateDto } from './create-gift-card-template.dto';

export class UpdateGiftCardTemplateDto extends PartialType(
  CreateGiftCardTemplateDto,
) {}
