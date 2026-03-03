import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  CampaignTargetType,
  CampaignDisplayType,
  CampaignUnlockMode,
  SpendingChannel,
  CampaignCategory,
  CampaignUsageType,
} from '../campaign-cashback.enum';

export class CreateCampaignCashbackDto {
  @ApiProperty({
    example: 'Spring 2026 Promo',
    description: 'The name of the campaign',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: CampaignCategory,
    example: CampaignCategory.REGULAR,
    description: 'Type of campaign (REGULAR or SEASONAL)',
  })
  @IsEnum(CampaignCategory)
  type: CampaignCategory;

  @ApiProperty({
    description: 'Season ID (required if type is SEASONAL)',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ValidateIf((o) => o.type === CampaignCategory.SEASONAL)
  @IsString()
  seasonId?: string;

  @ApiProperty({
    description: 'Start date (required if type is REGULAR)',
    required: false,
    example: '2026-03-01T00:00:00Z',
  })
  @ValidateIf((o) => o.type === CampaignCategory.REGULAR)
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (required if type is REGULAR)',
    required: false,
    example: '2026-04-01T23:59:59Z',
  })
  @ValidateIf((o) => o.type === CampaignCategory.REGULAR)
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    enum: CampaignTargetType,
    example: CampaignTargetType.CUSTOMER,
    description:
      'Target audience type (CUSTOMER, BUSINESS, ALL, SPECIFIC_USERS)',
  })
  @IsEnum(CampaignTargetType)
  targetType: CampaignTargetType;

  @ApiProperty({
    enum: CampaignDisplayType,
    example: CampaignDisplayType.E_CARD,
    description: 'UI display style (VOUCHER or E_CARD)',
  })
  @IsEnum(CampaignDisplayType)
  displayType: CampaignDisplayType;

  @ApiProperty({
    example: 30,
    description: 'Total face value of the campaign cashback',
  })
  @IsNumber()
  totalValue: number;

  @ApiProperty({
    enum: CampaignUnlockMode,
    example: CampaignUnlockMode.REQUIRE_FULL_UNLOCK,
    description:
      'Unlock strategy: REQUIRE_FULL_UNLOCK (must pay 1/3 first) or ALLOW_PRELOADED_USAGE (can use 2/3 immediately)',
  })
  @IsEnum(CampaignUnlockMode)
  unlockMode: CampaignUnlockMode;

  @ApiProperty({
    example: '2026-12-31T23:59:59Z',
    description: 'When the card itself expires',
  })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({
    required: false,
    example: 30,
    description: 'Number of days user has to complete tasks after activation',
  })
  @IsNumber()
  @IsOptional()
  activationTimerDays?: number;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['WATCH_VIDEO', 'COMPLETE_SURVEY'],
    description: 'Tasks user must perform',
  })
  @IsArray()
  @IsOptional()
  activationTasks?: string[];

  @ApiProperty({
    required: false,
    example: false,
    description: 'Is this an external partner campaign?',
  })
  @IsBoolean()
  @IsOptional()
  externalCampaign?: boolean;

  @ApiProperty({
    required: false,
    example: 'https://partner.com/redeem',
    description: 'URL for external redemption',
  })
  @IsString()
  @IsOptional()
  externalRedemptionUrl?: string;

  // Value 1 Config
  @ApiProperty({ example: '247GBS Cashback' })
  @IsString()
  value1Title: string;

  @ApiProperty({ example: 'Funded by 247GBS for local shopping.' })
  @IsString()
  value1Description: string;

  @ApiProperty({ example: 'Redeemable at participating stores.' })
  @IsString()
  value1UsageText: string;

  @ApiProperty({
    enum: SpendingChannel,
    isArray: true,
    example: [SpendingChannel.HYPERLOCAL],
  })
  @IsArray()
  @IsEnum(SpendingChannel, { each: true })
  value1Channels: SpendingChannel[];

  @ApiProperty({
    enum: CampaignUsageType,
    isArray: true,
    example: [CampaignUsageType.ORDER_PRODUCT],
  })
  @IsArray()
  @IsEnum(CampaignUsageType, { each: true })
  value1UsageTypes: CampaignUsageType[];

  // Value 2 Config
  @ApiProperty({ example: 'System Bonus' })
  @IsString()
  value2Title: string;

  @ApiProperty({ example: 'Internal system reward.' })
  @IsString()
  value2Description: string;

  @ApiProperty({ example: 'Use for online services.' })
  @IsString()
  value2UsageText: string;

  @ApiProperty({
    enum: SpendingChannel,
    isArray: true,
    example: [SpendingChannel.ONLINE],
  })
  @IsArray()
  @IsEnum(SpendingChannel, { each: true })
  value2Channels: SpendingChannel[];

  @ApiProperty({
    enum: CampaignUsageType,
    isArray: true,
    example: [CampaignUsageType.BOOK_SERVICE],
  })
  @IsArray()
  @IsEnum(CampaignUsageType, { each: true })
  value2UsageTypes: CampaignUsageType[];

  // Value 3 Config
  @ApiProperty({ example: 'Your Contribution' })
  @IsString()
  value3Title: string;

  @ApiProperty({ example: 'The portion you paid.' })
  @IsString()
  value3Description: string;

  @ApiProperty({ example: 'Use anywhere on the platform.' })
  @IsString()
  value3UsageText: string;

  @ApiProperty({
    enum: SpendingChannel,
    isArray: true,
    example: [
      SpendingChannel.ONLINE,
      SpendingChannel.HYPERLOCAL,
      SpendingChannel.NEARBY,
    ],
  })
  @IsArray()
  @IsEnum(SpendingChannel, { each: true })
  value3Channels: SpendingChannel[];

  @ApiProperty({
    enum: CampaignUsageType,
    isArray: true,
    example: [CampaignUsageType.ANYWHERE],
  })
  @IsArray()
  @IsEnum(CampaignUsageType, { each: true })
  value3UsageTypes: CampaignUsageType[];

  @ApiProperty({
    default: true,
    description: 'Apply to all users of the target type',
  })
  @IsBoolean()
  selectAll: boolean;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Specific User IDs if selectAll is false',
  })
  @IsArray()
  @IsOptional()
  targetIds?: string[];
}
