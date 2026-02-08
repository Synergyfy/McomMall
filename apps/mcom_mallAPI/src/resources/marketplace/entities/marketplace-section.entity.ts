import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Product } from '../../product/entities/product.entity';

export enum SectionType {
  FLASH_SALE = 'flash_sale',
  PROMO_CAROUSEL = 'promo_carousel',
  FEATURED_GRID = 'featured_grid',
}

@Entity('marketplace_sections')
export class MarketplaceSection extends AbstractBaseEntity {
  @ApiProperty({ enum: SectionType })
  @Column({ unique: true })
  type: SectionType;

  @ApiProperty({ example: 'Flash Sales' })
  @Column()
  title: string;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isVisible: boolean;

  @ApiProperty({ example: { endTime: '2024-12-31T23:59:59Z' }, required: false })
  @Column('jsonb', { nullable: true })
  config: any; 
  // For Flash Sale: { endTime: Date }
  // For Promo: { itemsPerView: number }

  @ApiProperty({ type: () => [Product], description: 'List of products featured in this section' })
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'marketplace_section_products',
    joinColumn: { name: 'sectionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];
}
