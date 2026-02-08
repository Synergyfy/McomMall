import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { WalletTransactionType } from '../entities/wallet-transaction.entity';

export class CreditEarningDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(WalletTransactionType)
  type: WalletTransactionType;

  @IsNotEmpty()
  @IsString()
  description: string;
}
