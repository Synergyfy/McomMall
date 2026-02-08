import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ImportGiftCardDto {
  @ApiProperty({
    description: 'The amount for the gift card.',
    example: 50,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: "The recipient's email address.",
    example: 'recipient@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiProperty({
    description: "The recipient's name.",
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({
    description: "The sender's name.",
    example: 'Jane Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiProperty({
    description: 'A personal message to the recipient.',
    example: 'Happy Birthday!',
    required: false,
  })
  @IsOptional()
  @IsString()
  personalMessage?: string;
}
