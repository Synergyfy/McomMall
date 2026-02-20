import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTerminalCashbackClaimDto {
  @ApiProperty({
    example: 'owner-uuid-here',
    description: 'The unique ID of the onboarded owner',
  })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({ example: 3.0, description: 'Cashback amount to be claimed' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 18.0,
    description: 'Total spend amount from receipt',
  })
  @IsNumber()
  @IsOptional()
  spendAmount?: number;

  @ApiProperty({
    example: 'https://example.com/receipt.jpg',
    description: 'URL of the proof image',
  })
  @IsUrl()
  @IsOptional()
  proofUrl?: string;

  @ApiProperty({
    description: 'Metadata for fraud detection (GPS, device info, etc.)',
  })
  @IsOptional()
  meta?: Record<string, any>;
}
