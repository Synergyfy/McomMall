import { ApiProperty } from '@nestjs/swagger';
import { GiftCardTransactionType } from '../entities/gift-card-transaction.entity';

export class GiftCardTransactionHistoryDto {
  @ApiProperty({ description: 'The unique identifier of the transaction.' })
  id: string;

  @ApiProperty({
    description: 'The type of the transaction.',
    enum: GiftCardTransactionType,
  })
  type: GiftCardTransactionType;

  @ApiProperty({ description: 'The amount of the transaction.' })
  amount: number;

  @ApiProperty({ description: 'The date and time the transaction occurred.' })
  createdAt: Date;

  @ApiProperty({
    description: 'The name of the customer involved in the transaction.',
    example: 'John Doe',
  })
  customerName: string;

  @ApiProperty({
    description: 'The email of the customer involved in the transaction.',
    example: 'john.doe@example.com',
  })
  customerEmail: string;

  @ApiProperty({
    description: 'The code of the gift card associated with the transaction.',
  })
  giftCardCode: string;
}
