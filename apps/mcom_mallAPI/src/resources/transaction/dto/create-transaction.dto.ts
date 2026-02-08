import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  offerId: string;

  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;
}
