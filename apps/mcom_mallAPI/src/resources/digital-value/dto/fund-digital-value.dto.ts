import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundDigitalValueDto {
  @ApiProperty({
    example: 50.0,
    description: "The amount to add to the instrument's balance.",
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}
