import { ApiProperty } from '@nestjs/swagger';
import { PointTransactionType } from '../../transaction/entities/point-transaction.entity';

class CustomerDto {
  @ApiProperty({
    description: "The customer's unique identifier.",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: "The customer's full name.",
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: "The customer's email address.",
    example: 'john.doe@example.com',
  })
  email: string;
}

export class PromotionTransactionHistoryDto {
  @ApiProperty({
    description: 'The unique identifier for the transaction.',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  id: string;

  @ApiProperty({
    description: 'The number of points involved in the transaction.',
    example: 100,
  })
  points: number;

  @ApiProperty({
    description: 'The type of transaction (e.g., EARNED, REDEMPTION).',
    enum: PointTransactionType,
    example: PointTransactionType.EARNED,
  })
  type: PointTransactionType;

  @ApiProperty({
    description: 'The date and time when the transaction occurred.',
    example: '2023-10-26T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The customer who performed the transaction.',
    type: () => CustomerDto,
  })
  customer: CustomerDto;
}
