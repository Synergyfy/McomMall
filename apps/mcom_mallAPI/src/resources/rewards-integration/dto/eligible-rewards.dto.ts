import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class EligibleRewardItemDto {
  @ApiProperty({ description: 'The ID of the product in the cart.' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'The quantity of the product.' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ description: 'Selected variants for the product.' })
  @IsOptional()
  selectedVariants?: Record<string, string>;
}

class EligibleRewardServiceDto {
  @ApiProperty({ description: 'The ID of the service being booked.' })
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ description: 'Resolved price for the booking.' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Quantity of the service booking.' })
  @IsNumber()
  @IsOptional()
  quantity?: number;
}

export class EligibleRewardsDto {
  @ApiProperty({ type: [EligibleRewardItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EligibleRewardItemDto)
  items: EligibleRewardItemDto[];

  @ApiPropertyOptional({ type: [EligibleRewardServiceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EligibleRewardServiceDto)
  @IsOptional()
  serviceBookings?: EligibleRewardServiceDto[];
}
