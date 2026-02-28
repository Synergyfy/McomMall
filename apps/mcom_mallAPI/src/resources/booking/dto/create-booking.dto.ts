import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfGuests?: number;

  @IsOptional()
  @IsUUID('all', { each: true })
  addonIds?: string[];
}
