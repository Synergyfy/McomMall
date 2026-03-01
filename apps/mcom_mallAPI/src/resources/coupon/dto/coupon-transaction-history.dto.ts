import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../coupon.enum';

export class CouponTransactionHistoryDto {
  @ApiProperty({ description: 'The unique identifier of the transaction.' })
  id: string;

  @ApiProperty({
    description: 'The type of the transaction.',
    enum: TransactionType,
  })
  type: TransactionType;

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
    description: 'The code of the coupon associated with the transaction.',
  })
  couponCode: string;
}
