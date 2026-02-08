import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAssetCategoryDto {
  @ApiProperty({ description: 'The name of the asset category.' })
  @IsString()
  @IsNotEmpty()
  name: string;
}