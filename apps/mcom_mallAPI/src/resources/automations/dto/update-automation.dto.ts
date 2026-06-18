import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TriggerType } from '../entities/automation.entity';

export class UpdateAutomationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(TriggerType)
  @IsOptional()
  triggerType?: TriggerType;

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
