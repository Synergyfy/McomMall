import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckBalancePinDto {
  @ApiProperty({
    description: 'Unique gift card code',
    example: 'GC-9821-4412-8812',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'Optional 4-digit security PIN',
    example: '1234',
  })
  @IsOptional()
  @IsString()
  @Length(4, 8)
  pin?: string;
}
