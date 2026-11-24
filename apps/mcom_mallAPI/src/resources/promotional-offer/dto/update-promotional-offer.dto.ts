import { PartialType } from '@nestjs/swagger';
import { CreatePromotionalOfferDto } from './create-promotional-offer.dto';

export class UpdatePromotionalOfferDto extends PartialType(
  CreatePromotionalOfferDto,
) {}
