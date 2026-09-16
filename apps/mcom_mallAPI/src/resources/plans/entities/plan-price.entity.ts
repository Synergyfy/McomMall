import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { PlanVariant } from './plan-variant.entity';

/**
 * Versioned price for one plan variant. Price changes never mutate history:
 * close the active row (effectiveTo + isActive=false) and insert a new one,
 * so existing subscriptions keep their locked-in priceId snapshot.
 */
@Entity('plan_prices')
@Index(['planVariantId', 'isActive'])
export class PlanPrice extends AbstractBaseEntity {
  @ApiProperty({ description: 'Owning plan variant id' })
  @Column({ name: 'plan_variant_id' })
  planVariantId: string;

  @ManyToOne(() => PlanVariant, (variant) => variant.prices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plan_variant_id' })
  planVariant: PlanVariant;

  @ApiProperty({ example: 'GBP' })
  @Column({ default: 'GBP' })
  currency: string;

  @ApiProperty({
    example: 29.99,
    description: 'One-off price for the full tier duration',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ example: 'price_123', nullable: true })
  @Column({ nullable: true })
  stripePriceId: string | null;

  @ApiProperty({ example: 'P-123', nullable: true })
  @Column({ nullable: true })
  paypalPlanId: string | null;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'When this price became effective' })
  @Column({
    name: 'effective_from',
    type: 'timestamptz',
    default: () => 'now()',
  })
  effectiveFrom: Date;

  @ApiProperty({
    nullable: true,
    description: 'When this price was superseded',
  })
  @Column({ name: 'effective_to', type: 'timestamptz', nullable: true })
  effectiveTo: Date | null;
}
