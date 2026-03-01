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
  @IsInt()
  @Min(1)
  numberOfStaff?: number;

  @IsOptional()
  @IsUUID('all', { each: true })
  addonIds?: string[];

  @IsOptional()
  address?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  problemDescription?: string;

  @IsOptional()
  photos?: string[];

  @IsOptional()
  config?: any;
}
