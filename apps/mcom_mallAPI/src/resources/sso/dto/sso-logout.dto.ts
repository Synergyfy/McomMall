import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SsoLogoutDto {
  @ApiProperty({ description: 'SSO access token to invalidate' })
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
