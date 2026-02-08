import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubcategoryDto {
  @ApiProperty({
    description: 'The name of the subcategory',
    example: 'Android Phones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The UUID of the parent category',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'The image URL of the subcategory',
    example: 'https://example.com/images/android.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'The description of the subcategory',
    example: 'Smartphones running Android OS',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
