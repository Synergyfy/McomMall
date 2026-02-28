import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum VisualType {
  COUPON = 'coupon',
  VOUCHER = 'voucher',
}

export enum FunctionalType {
  PRICE_REDUCER = 'price_reducer',
  SPENDING_POWER = 'spending_power',
}

export enum ScopeType {
  ANY_SHOP = 'any_shop',
  SPECIFIC_SHOPS = 'specific_shops',
  EXPO_ONLY = 'expo_only',
  CAMPAIGN_ONLY = 'campaign_only',
}

export enum BurnStrategy {
  REAL_FIRST = 'real_first',
  REWARD_FIRST = 'reward_first',
  PROPORTIONAL = 'proportional',
}

export interface SplitRatioConfig {
  real: number; // e.g., 0.5 for 50%
  reward: number; // e.g., 0.5 for 50%
}

export class SplitRatioConfigDto {
  @ApiProperty()
  real: number;
  @ApiProperty()
  reward: number;
}

@Entity('reward_definitions')
export class RewardDefinition extends AbstractBaseEntity {
  @ApiProperty({ example: 'Spring Expo Voucher' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Voucher for the 2026 Spring Expo', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ enum: VisualType, default: VisualType.VOUCHER })
  @Column({
    type: 'enum',
    enum: VisualType,
    default: VisualType.VOUCHER,
  })
  visualType: VisualType;

  @ApiProperty({ enum: FunctionalType, default: FunctionalType.SPENDING_POWER })
  @Column({
    type: 'enum',
    enum: FunctionalType,
    default: FunctionalType.SPENDING_POWER,
  })
  functionalType: FunctionalType;

  @ApiProperty({ type: SplitRatioConfigDto })
  @Column({ type: 'jsonb' })
  splitRatio: SplitRatioConfig;

  @ApiProperty({ enum: BurnStrategy, default: BurnStrategy.REAL_FIRST })
  @Column({
    type: 'enum',
    enum: BurnStrategy,
    default: BurnStrategy.REAL_FIRST,
  })
  burnStrategy: BurnStrategy;

  @ApiProperty({ enum: ScopeType, default: ScopeType.ANY_SHOP })
  @Column({
    type: 'enum',
    enum: ScopeType,
    default: ScopeType.ANY_SHOP,
  })
  scopeType: ScopeType;

  @ApiProperty({ type: () => Business, isArray: true })
  @ManyToMany(() => Business, { cascade: true })
  @JoinTable({
    name: 'reward_definition_shops',
    joinColumn: { name: 'rewardDefinitionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'businessId', referencedColumnName: 'id' },
  })
  validShops: Business[];

  @ApiProperty({ example: ['Spring', '2026'], nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  seasonalLabels: string[];

  @ApiProperty({ default: true })
  @Column({ default: true })
  isActive: boolean;
}
