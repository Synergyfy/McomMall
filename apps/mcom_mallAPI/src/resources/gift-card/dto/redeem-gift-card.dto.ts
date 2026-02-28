import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class RedeemGiftCardDto {
  @ApiProperty({
    description: 'The unique code of the gift card to redeem.',
    example: 'MCOM-ABC123DEF456',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'The amount to redeem from the gift card.',
    example: 25.5,
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}
