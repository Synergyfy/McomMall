import { IsNumber, Min } from 'class-validator';

export class InitiateReloadDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
