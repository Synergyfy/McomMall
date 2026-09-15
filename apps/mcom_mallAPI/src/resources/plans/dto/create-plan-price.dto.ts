import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanPriceDto {
  @ApiProperty({
    example: 34.99,
    description: 'New one-off price; supersedes the active price',
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'GBP' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'price_456' })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiPropertyOptional({ example: 'P-456' })
  @IsString()
  @IsOptional()
  paypalPlanId?: string;
}
