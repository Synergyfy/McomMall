import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { TaxonomyCategory } from './taxonomy-category.entity';

@Entity('taxonomy_subcategories')
export class TaxonomySubcategory extends AbstractBaseEntity {
  @ApiProperty({ example: 'Android', description: 'The name of the subcategory' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'https://example.com/sub.jpg', description: 'The image of the subcategory', required: false })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({ example: 'Android phones', description: 'The description of the subcategory', required: false })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => TaxonomyCategory, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: TaxonomyCategory;

  @ApiProperty({ example: 'uuid-category-id', description: 'The ID of the parent category' })
  @Column()
  categoryId: string;
}
