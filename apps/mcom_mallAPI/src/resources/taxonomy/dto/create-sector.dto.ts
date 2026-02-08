import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSectorDto {
  @ApiProperty({
    description: 'The name of the sector',
    example: 'Electronics',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The image URL of the sector',
    example: 'https://example.com/images/electronics.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'The description of the sector',
    example: 'All kinds of electronic gadgets and devices',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
