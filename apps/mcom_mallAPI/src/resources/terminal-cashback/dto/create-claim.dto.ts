import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTerminalCashbackClaimDto {
  @ApiProperty({ example: 'BEANTHERE01', description: 'The unique ID of the terminal/business' })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ example: 3.00, description: 'Cashback amount to be claimed' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 18.00, description: 'Total spend amount from receipt' })
  @IsNumber()
  @IsOptional()
  spendAmount?: number;

  @ApiProperty({ example: 'https://example.com/receipt.jpg', description: 'URL of the proof image' })
  @IsUrl()
  @IsOptional()
  proofUrl?: string;

  @ApiProperty({ description: 'Metadata for fraud detection (GPS, device info, etc.)' })
  @IsOptional()
  meta?: Record<string, any>;
}
