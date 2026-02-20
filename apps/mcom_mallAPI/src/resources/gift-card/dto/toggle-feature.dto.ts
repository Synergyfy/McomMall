import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean } from 'class-validator';

export class ToggleFeatureDto {
  @ApiProperty({
    description: 'The ID of the business owner (User) to modify.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  ownerId: string;

  @ApiProperty({
    description: 'Set to true to enable the feature, false to disable.',
    example: true,
  })
  @IsBoolean()
  isEnabled: boolean;
}
