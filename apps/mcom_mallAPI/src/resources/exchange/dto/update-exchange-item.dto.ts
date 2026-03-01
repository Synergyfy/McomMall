import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateExchangeItemDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({
    description: 'The updated title of the exchange item.',
    example: 'Vintage Wooden Chair',
    maxLength: 100,
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The updated description of the item.',
    example:
      'A beautifully crafted vintage chair made from solid oak, recently restored.',
  })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'An updated optional image URL for the item.',
    example: 'https://example.com/restored-chair.jpg',
  })
  imageUrl?: string;
}
