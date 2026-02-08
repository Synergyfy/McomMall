import { PartialType } from '@nestjs/swagger';
import { CreateGiftCardAssetDto } from './create-gift-card-asset.dto';

export class UpdateGiftCardAssetDto extends PartialType(
  CreateGiftCardAssetDto,
) {}