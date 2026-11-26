import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { TaxonomyCategory } from './taxonomy-category.entity';

@Entity('sectors')
export class Sector extends AbstractBaseEntity {
  @ApiProperty({
    example: 'Electronics',
    description: 'The name of the sector',
  })
  @Column({ unique: true })
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
    example: 'https://example.com/img.jpg',
    description: 'The image of the sector',
    required: false,
  })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({
    example: 'All electronics',
    description: 'The description of the sector',
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @OneToMany(() => TaxonomyCategory, (category) => category.sector, {
    cascade: true,
  })
  categories: TaxonomyCategory[];
}
