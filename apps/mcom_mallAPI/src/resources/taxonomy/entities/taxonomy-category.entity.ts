import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Sector } from './sector.entity';
import { TaxonomySubcategory } from './taxonomy-subcategory.entity';

@Entity('taxonomy_categories')
export class TaxonomyCategory extends AbstractBaseEntity {
  @ApiProperty({
    example: 'Mobile Phones',
    description: 'The name of the category',
  })
  @Column({ unique: true })
  name: string;

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
