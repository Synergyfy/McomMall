import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsEmail,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class PurchaseVoucherDto {
  @IsUUID()
  @IsNotEmpty()
  voucherProductId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  personalMessage?: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string; // ISO 8601 format
}
