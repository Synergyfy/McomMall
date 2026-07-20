import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallbackQueryDto {
  @ApiProperty({ description: 'Authorization code from MCOM Central' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'CSRF state parameter' })
  @IsString()
  @IsNotEmpty()
  state: string;
}
