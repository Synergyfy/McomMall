import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundDigitalValueDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;
}
