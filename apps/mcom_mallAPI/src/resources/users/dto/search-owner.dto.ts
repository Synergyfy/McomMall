import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class SearchOwnerDto {
  @ApiPropertyOptional({
    description: 'A list of skills to search for.',
    example: ['Plumbing', 'Electrical'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'The service area to search for.',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  serviceArea?: string;
}
