import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Mobile Phones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The UUID of the parent sector',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  @IsNotEmpty()
  sectorId: string;

  @ApiProperty({
    description: 'The image URL of the category',
    example: 'https://example.com/images/mobiles.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'The description of the category',
    example: 'Smartphones and feature phones',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
