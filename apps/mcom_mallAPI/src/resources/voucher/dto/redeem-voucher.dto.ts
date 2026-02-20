import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class RedeemVoucherDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number; // For partial redemption
}