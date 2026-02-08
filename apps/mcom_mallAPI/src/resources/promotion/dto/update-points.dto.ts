import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdatePointsDto {
  @IsInt()
  @IsNotEmpty()
  amount: number;
}
