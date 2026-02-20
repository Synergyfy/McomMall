import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DigitalValueType } from '../digital-value.enums';

export class CreateDigitalValueDto {
  @ApiProperty({ enum: DigitalValueType })
  @IsEnum(DigitalValueType)
  type: DigitalValueType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  initialValue: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  rewardId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
