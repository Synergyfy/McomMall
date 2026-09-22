import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebhookDto {
  @ApiProperty({ example: 'Order events to ERP' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://erp.example.com/hooks/orders' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: ['order.created', 'order.paid'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  events?: string[];

  @ApiPropertyOptional({ example: 'whsec_abc123' })
  @IsString()
  @IsOptional()
  secret?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
