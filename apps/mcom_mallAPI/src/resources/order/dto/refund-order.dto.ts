import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class RefundOrderDto {
  @ApiPropertyOptional({
    description:
      'Optional amount. Only full refunds are supported; if supplied it must equal the order total.',
    example: 49.99,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Internal refund reason.' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Return tracked product stock to inventory. Defaults to true.',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  restock?: boolean;

  @ApiPropertyOptional({
    description:
      'Cancel bundled service bookings. Defaults to true. Their local pending earnings are reversed as well.',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  cancelBookings?: boolean;
}
