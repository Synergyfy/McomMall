import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Sector } from './sector.entity';
import { TaxonomySubcategory } from './taxonomy-subcategory.entity';

@Entity('taxonomy_categories')
@Unique('UQ_taxonomy_categories_parent_name', ['sectorId', 'name'])
export class TaxonomyCategory extends AbstractBaseEntity {
  @ApiProperty({
    example: 'Mobile Phones',
    description: 'The name of the category',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Stable ID of the matching taxonomy row in MCOM Central Hub',
    required: false,
  })
  @Column({ nullable: true, unique: true })
  centralId: string;

  @ApiProperty({
    description: 'Slug of the matching taxonomy row in MCOM Central Hub',
    required: false,
  })
  @Column({ nullable: true })
  centralSlug: string;

  @ApiProperty({
    description: 'When this row was linked to MCOM Central Hub',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  centralSyncedAt: Date;

  @ApiProperty({
    example: 'https://example.com/cat.jpg',
    description: 'The image of the category',
    required: false,
  })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({
    example: 'Smartphones etc.',
    description: 'The description of the category',
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Sector, (sector) => sector.categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sectorId' })
  sector: Sector;

  @ApiProperty({
    example: 'uuid-sector-id',
    description: 'The ID of the parent sector',
  })
  @Column()
  sectorId: string;

  @OneToMany(() => TaxonomySubcategory, (subcategory) => subcategory.category, {
    cascade: true,
  })
  subcategories: TaxonomySubcategory[];
}
