import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import {
  MembershipCreditType,
  MembershipCreditStatus,
} from '../entities/membership-credit.entity';

export class CreateMembershipCreditDto {
  @ApiProperty({
    description: 'Type of credit',
    enum: MembershipCreditType,
    example: MembershipCreditType.PROMOTION,
  })
  @IsEnum(MembershipCreditType)
  type: MembershipCreditType;

  @ApiProperty({
    description: 'Monetary value of the credit',
    example: 25.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Display title of the credit',
    example: 'Spring Campaign Bonus',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Business this credit belongs to',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiPropertyOptional({
    description: 'Expiry date of the credit (ISO date)',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Free-form note about the credit',
    example: 'Awarded during Q3 membership audit',
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateMembershipCreditStatusDto {
  @ApiProperty({
    description: 'New status for the credit',
    enum: MembershipCreditStatus,
    example: MembershipCreditStatus.REDEEMED,
  })
  @IsEnum(MembershipCreditStatus)
  status: MembershipCreditStatus;

  @ApiPropertyOptional({
    description: 'Free-form note about the status change',
    example: 'Redeemed manually by the merchant',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
