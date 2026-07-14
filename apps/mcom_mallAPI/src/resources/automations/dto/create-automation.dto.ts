import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TriggerType } from '../entities/automation.entity';

export class CreateAutomationDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TriggerType)
  @IsNotEmpty()
  triggerType: TriggerType;

  @IsInt()
  @IsOptional()
  targetRadius?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customerTiers?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  flowConfig?: any;
}
