import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsDateString,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'The name of the group.',
    example: 'Local Retail Alliance',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The local area or neighborhood the group operates in.',
    example: 'Shoreditch',
  })
  @IsString()
  @IsNotEmpty()
  localArea: string;

  @ApiProperty({
    description: 'The target size of the group.',
    enum: [6, 12],
    example: 6,
  })
  @IsIn([6, 12])
  size: 6 | 12;

  @ApiProperty({
    description: 'The deadline for recruiting members.',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDateString()
  recruitmentDeadline: string;

  @ApiProperty({
    description: 'An optional URL to a pitch deck, image, or video.',
    example: 'https://example.com/pitch.pdf',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  pitchUrl?: string;
}
