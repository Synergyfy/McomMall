import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity('marketplace_categories')
export class MarketplaceCategory extends AbstractBaseEntity {
  @ApiProperty({ example: 'Electronics' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Smartphone', required: false, description: 'Lucide icon name' })
  @Column({ nullable: true })
  iconName: string; // e.g., 'Home', 'Smartphone' (matches Lucide icons on frontend)

  @ApiProperty({ example: 'uuid-taxonomy-category-id', required: false })
  @Column({ nullable: true })
  targetCategoryId: string; // ID of the actual TaxonomyCategory to filter by

  @ApiProperty({ example: 0 })
  @Column({ default: 0 })
  displayOrder: number;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isVisible: boolean;
}
