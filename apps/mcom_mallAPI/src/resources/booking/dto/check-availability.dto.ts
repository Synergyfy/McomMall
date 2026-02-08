import { IsDateString, IsUUID } from 'class-validator';

export class CheckAvailabilityDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
