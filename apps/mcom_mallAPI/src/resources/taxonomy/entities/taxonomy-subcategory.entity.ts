import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { TaxonomyCategory } from './taxonomy-category.entity';

@Entity('taxonomy_subcategories')
@Unique('UQ_taxonomy_subcategories_parent_name', ['categoryId', 'name'])
export class TaxonomySubcategory extends AbstractBaseEntity {
  @ApiProperty({
    example: 'Android',
    description: 'The name of the subcategory',
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
    example: 'https://example.com/sub.jpg',
    description: 'The image of the subcategory',
    required: false,
  })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({
    example: 'Android phones',
    description: 'The description of the subcategory',
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => TaxonomyCategory, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: TaxonomyCategory;

  @ApiProperty({
    example: 'uuid-category-id',
    description: 'The ID of the parent category',
  })
  @Column()
  categoryId: string;
}
