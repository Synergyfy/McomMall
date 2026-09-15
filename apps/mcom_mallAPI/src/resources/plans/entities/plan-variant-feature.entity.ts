import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { PlanVariant } from './plan-variant.entity';
import { Feature } from './feature.entity';

/** Value granted by one plan variant for one catalog feature. */
@Entity('plan_variant_features')
@Index(['planVariantId', 'featureId'], { unique: true })
export class PlanVariantFeature extends AbstractBaseEntity {
  @ApiProperty({ description: 'Owning plan variant id' })
  @Column({ name: 'plan_variant_id' })
  planVariantId: string;

  @ManyToOne(() => PlanVariant, (variant) => variant.variantFeatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plan_variant_id' })
  planVariant: PlanVariant;

  @ApiProperty({ description: 'Catalog feature id' })
  @Column({ name: 'feature_id' })
  featureId: string;

  @ManyToOne(() => Feature, (feature) => feature.variantFeatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'feature_id' })
  feature: Feature;

  @ApiProperty({
    example: '10',
    description: 'Raw value; cast by features.dataType (boolean|numeric|text)',
  })
  @Column({ type: 'text' })
  value: string;
}
