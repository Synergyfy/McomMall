import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class AdjustBalanceDto {
  @ApiProperty({
    description:
      'The amount to adjust the balance by. Can be positive (credit) or negative (debit).',
    example: -10.5,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'A note explaining the reason for the manual adjustment.',
    example: 'Customer goodwill gesture.',
  })
  @IsString()
  @IsNotEmpty()
  notes: string;
}
