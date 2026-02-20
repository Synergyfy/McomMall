import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductAttribute } from '../../product/interfaces/product-variant.interface';

@Entity('ProductVariantTemplates')
export class ProductVariantTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the template', example: 'Clothing Standard' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The product type this template applies to', example: 'physical' })
  @Column()
  productType: string;

  @ApiProperty({ description: 'The category this template applies to', example: 'Clothing' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'The sub-category this template applies to', example: 'T-Shirts' })
  @Column({ nullable: true })
  subCategory: string;

  @ApiProperty({
    description: 'Predefined attributes for this template'
  })
  @Column({ type: 'jsonb' })
  attributes: ProductAttribute[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
