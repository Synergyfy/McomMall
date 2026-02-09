import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great service!',
    description: 'Review comment',
  })
  @IsString()
  comment: string;

  @ApiProperty({
    example: 'uuid-string',
    description: 'ID of the business being reviewed',
  })
  @IsString()
  businessId: string;
}
