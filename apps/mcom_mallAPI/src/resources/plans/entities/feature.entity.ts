import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { FeatureDataType } from '../enums/feature-data-type.enum';
import { PlanVariantFeature } from './plan-variant-feature.entity';

/** Catalog of enforceable entitlements (e.g. max_listings, priority_support). */
@Entity('features')
export class Feature extends AbstractBaseEntity {
  @ApiProperty({ example: 'max_listings' })
  @Column({ unique: true })
  key: string;

  @ApiProperty({ example: 'Max listings' })
  @Column()
  name: string;

  @ApiProperty({ enum: FeatureDataType, example: FeatureDataType.NUMERIC })
  @Column({ name: 'data_type', type: 'enum', enum: FeatureDataType })
  dataType: FeatureDataType;

  @OneToMany(() => PlanVariantFeature, (link) => link.feature)
  variantFeatures: PlanVariantFeature[];
}
