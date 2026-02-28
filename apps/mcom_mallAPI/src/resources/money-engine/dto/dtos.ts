import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  FunctionalType,
  ScopeType,
  SplitRatioConfig,
  VisualType,
} from '../entities/reward-definition.entity';
import { PaymentGateway } from '../../payments/enums/payment-gateway.enum';

export class SplitRatioDto {
  @ApiProperty({
    example: 0.5,
    description: 'The portion of value covered by Real Money (0-1)',
  })
  @IsNumber()
  real: number;

  @ApiProperty({
    example: 0.5,
    description: 'The portion of value covered by Reward Money (0-1)',
  })
  @IsNumber()
  reward: number;
}

export class CreateRewardDefinitionDto {
  @ApiProperty({ example: 'Spring Expo Voucher £100' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '50/50 Split voucher for the Spring Expo' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: VisualType, example: VisualType.VOUCHER })
  @IsEnum(VisualType)
  visualType: VisualType;

  @ApiProperty({ enum: FunctionalType, example: FunctionalType.SPENDING_POWER })
  @IsEnum(FunctionalType)
  functionalType: FunctionalType;

  @ApiProperty({ type: SplitRatioDto })
  @ValidateNested()
  @Type(() => SplitRatioDto)
  splitRatio: SplitRatioDto;

  @ApiProperty({ enum: ScopeType, example: ScopeType.ANY_SHOP })
  @IsEnum(ScopeType)
  scopeType: ScopeType;

  @ApiPropertyOptional({
    example: ['shop-uuid-1', 'shop-uuid-2'],
    description: 'List of Shop IDs if scope is specific',
  })
  @IsUUID('4', { each: true })
  @IsOptional()
  validShopIds?: string[];

  @ApiPropertyOptional({ example: ['Spring', '2026'] })
  @IsString({ each: true })
  @IsOptional()
  seasonalLabels?: string[];

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRewardDefinitionDto extends PartialType(
  CreateRewardDefinitionDto,
) {}

export class PurchaseVoucherDto {
  @ApiProperty({
    example: 'reward-def-uuid',
    description: 'ID of the Reward Definition',
  })
  @IsUUID()
  rewardDefinitionId: string;

  @ApiProperty({
    example: 50,
    description: 'Amount user pays (Real Money portion)',
  })
  @IsNumber()
  paymentAmount: number;

  @ApiProperty({
    example: 'pi_3M...',
    description: 'Stripe Payment Intent ID or PayPal Order ID',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({ enum: PaymentGateway, example: PaymentGateway.STRIPE })
  @IsEnum(PaymentGateway)
  paymentGateway: PaymentGateway;
}

export class CashbackInjectionDto {
  @ApiProperty({ example: 'user-voucher-uuid' })
  @IsUUID()
  userVoucherId: string;

  @ApiProperty({ example: 5.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'shop-uuid' })
  @IsUUID()
  shopId: string;
}

export class SpendDto {
  @ApiProperty({ example: 'user-voucher-uuid' })
  @IsUUID()
  userVoucherId: string;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'shop-uuid' })
  @IsUUID()
  shopId: string;
}

export class DefinitionResponseDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  visualType: string;
}

export class UserVoucherResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'ABC123XYZ789' })
  code: string;

  @ApiProperty({
    example: 100.0,
    description: 'Combined Real + Reward balance',
  })
  totalBalance: number;

  @ApiProperty({ example: 'active' })
  state: string;

  @ApiProperty({ type: DefinitionResponseDto })
  definition: DefinitionResponseDto;
}

export class TransferDto {
  @ApiProperty({ example: 'uuid-sender-voucher' })
  @IsUUID()
  fromVoucherId: string;

  @ApiProperty({ example: 'uuid-receiver-voucher' })
  @IsUUID()
  toVoucherId: string;

  @ApiProperty({ example: 10.0 })
  @IsNumber()
  amount: number;
}

export class MetricWithChangeDto {
  @ApiProperty({ example: 1250.5 })
  value: number;

  @ApiProperty({
    example: 15.5,
    description: 'Percentage change compared to previous period',
  })
  percentageChange: number;
}

export class MoneyEngineAnalyticsDto {
  @ApiProperty({ type: MetricWithChangeDto })
  activeVouchers: MetricWithChangeDto;

  @ApiProperty({ type: MetricWithChangeDto })
  realMoneyInput: MetricWithChangeDto;

  @ApiProperty({ type: MetricWithChangeDto })
  rewardValueGiven: MetricWithChangeDto;

  @ApiProperty({ type: MetricWithChangeDto })
  networkUtilization: MetricWithChangeDto;
}

export class VoucherAdminResponseDto extends UserVoucherResponseDto {
  @ApiProperty({ example: 'customer@example.com' })
  ownerEmail: string;

  @ApiProperty({ example: 50.0 })
  realBalance: number;

  @ApiProperty({ example: 50.0 })
  rewardBalance: number;

  @ApiProperty({ example: '2026-01-17T12:00:00Z' })
  createdAt: Date;
}

export class BusinessStatsResponseDto {
  @ApiProperty()
  activeVouchersCount: number;

  @ApiProperty()
  totalSpentInShop: number;

  @ApiProperty()
  customersCount: number;
}

export class CustomerMoneyStatsDto {
  @ApiProperty({ example: 5, description: 'Number of active vouchers owned' })
  activeVouchersCount: number;

  @ApiProperty({
    example: 500.0,
    description: 'Total value of all active vouchers (Real + Reward)',
  })
  totalCurrentBalance: number;

  @ApiProperty({
    example: 250.0,
    description: 'Total Real Money balance in active vouchers',
  })
  currentRealBalance: number;

  @ApiProperty({
    example: 250.0,
    description: 'Total Reward Money balance in active vouchers',
  })
  currentRewardBalance: number;

  @ApiProperty({
    example: 50.0,
    description: 'Total lifetime rewards received from business cashback',
  })
  totalBusinessRewardsReceived: number;

  @ApiProperty({
    example: 1200.0,
    description: 'Total amount spent across all vouchers',
  })
  totalSpent: number;
}
