import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteToEventDto {
  @ApiProperty({ description: 'Business ID hosting the event' })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ description: 'Event UUID or reference ID' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiPropertyOptional({ description: 'Custom invitation note' })
  @IsOptional()
  @IsString()
  customNote?: string;

  @ApiPropertyOptional({
    description: 'Target customer segment IDs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmentIds?: string[];
}
