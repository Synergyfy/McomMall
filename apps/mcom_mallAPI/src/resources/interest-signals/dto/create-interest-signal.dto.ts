import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInterestSignalDto {
  @IsString()
  @IsNotEmpty()
  signalType: string;

  @IsString()
  @IsOptional()
  voterIp?: string;
}
