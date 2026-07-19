import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SsoRefreshDto {
  @ApiProperty({ description: 'SSO refresh token from MCOM Solutions' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
