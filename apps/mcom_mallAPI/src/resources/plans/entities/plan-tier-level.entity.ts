import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { PlanTier } from '../enums/plan-tier.enum';
import { PlanVariant } from './plan-variant.entity';

/**
 * Senior design `tiers` table, renamed to `plan_tier_levels` to avoid
 * colliding with the legacy `tiers` table (which holds plan families today).
 * Rows are seeded once: Standard (90 days), Pro (180 days), Pro+ (1 calendar year).
 */
@Entity('plan_tier_levels')
export class PlanTierLevel extends AbstractBaseEntity {
  @ApiProperty({ enum: PlanTier, example: PlanTier.STANDARD })
  @Column({ type: 'enum', enum: PlanTier, unique: true })
  name: PlanTier;

  @ApiProperty({
    example: 1,
    description: 'Display order: Standard=1, Pro=2, Pro+=3',
  })
  @Column()
  sortOrder: number;

  @ApiProperty({
    example: 90,
    description: 'Fixed duration in days (null for calendar-year tiers)',
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  durationDays: number | null;

  @ApiProperty({
    example: false,
    description:
      'True for Pro+: expiry is same calendar date next year (leap-safe)',
  })
  @Column({ default: false })
  isCalendarYear: boolean;

  @OneToMany(() => PlanVariant, (variant) => variant.tierLevel)
  variants: PlanVariant[];
}
