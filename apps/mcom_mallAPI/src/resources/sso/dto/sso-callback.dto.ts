import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SsoCallbackDto {
  @ApiProperty({
    description: 'Authorization code received from MCOM Solutions',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'Redirect URI used in the authorization request',
  })
  @IsString()
  @IsOptional()
  redirect_uri?: string;
}
