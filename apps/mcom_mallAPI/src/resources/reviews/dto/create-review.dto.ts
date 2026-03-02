import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Rating from 1 to 5', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment', example: 'Great product!' })
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'ID of the business being reviewed',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiProperty({
    description: 'ID of the product being reviewed',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({
    description: 'ID of the service being reviewed',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;
}
