import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class BulkCreateGiftCardDto {
  @ApiProperty({
    description: 'The ID of the gift card template to use.',
    example: 'clq0x0q0a0000a0b0c0d0e0f0',
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: 'The initial balance for each gift card.',
    example: 25.5,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'The number of gift cards to generate.',
    example: 100,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
