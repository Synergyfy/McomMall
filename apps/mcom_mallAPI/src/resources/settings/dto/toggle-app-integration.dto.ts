import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ToggleAppIntegrationDto {
  @ApiProperty({
    description: 'App integration key (e.g. google_business, stripe_connect)',
  })
  @IsString()
  @IsNotEmpty()
  appKey: string;

  @ApiProperty({ description: 'Enable or disable state' })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({
    description: 'Optional integration config/tokens JSON',
  })
  @IsOptional()
  @IsObject()
  configJson?: Record<string, any>;
}
