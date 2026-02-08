import { IsBoolean, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class BlockSlotDto {
  @IsUUID()
  businessId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;
}
