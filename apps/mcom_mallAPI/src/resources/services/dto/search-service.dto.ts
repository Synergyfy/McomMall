import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SearchServiceDto {
  @ApiProperty({
    description: 'The search term to look for in service names and descriptions.',
    example: 'cleaning',
  })
  @IsString()
  @IsNotEmpty()
  term: string;
}