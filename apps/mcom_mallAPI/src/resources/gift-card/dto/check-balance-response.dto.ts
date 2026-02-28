import { ApiProperty } from '@nestjs/swagger';

export class CheckBalanceResponseDto {
  @ApiProperty({
    description: 'The original value of the gift card.',
    example: 100.0,
  })
  initialBalance: number;

  @ApiProperty({
    description: 'The remaining balance on the gift card.',
    example: 42.5,
  })
  currentBalance: number;

  @ApiProperty({
    description: 'The currency of the gift card.',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'The expiry date of the gift card.',
    example: '2025-12-31T23:59:59.999Z',
    nullable: true,
  })
  expiryDate: Date | null;
}
