import { ApiProperty } from '@nestjs/swagger';
import { GiftCard } from '../entities/gift-card.entity';

export class PurchasedGiftCardDto extends GiftCard {
  @ApiProperty({
    description: 'Indicates whether the gift card can be reloaded with more funds.',
    example: true,
  })
  isReloadable: boolean;
}
