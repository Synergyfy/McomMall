import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ImportGiftCardDto } from './import-gift-card.dto';

export class BulkImportGiftCardsDto {
  @ApiProperty({
    description: 'An array of gift card data objects to import.',
    type: [ImportGiftCardDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportGiftCardDto)
  giftCards: ImportGiftCardDto[];
}
