import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export interface ServiceTemplatePackage {
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
}

@Entity('service_templates')
export class ServiceTemplate extends AbstractBaseEntity {
  @ApiProperty({ example: 'Home Cleaning', description: 'Template name' })
  @Column()
  @Index()
  name: string;

  @ApiPropertyOptional({ example: 'Cleaning', description: 'Service category' })
  @Column({ nullable: true })
  category?: string;

  @ApiPropertyOptional({ example: 'Standard home cleaning services.' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: ' Tiered packages included in the template' })
  @Column({ type: 'jsonb', default: [] })
  packages: ServiceTemplatePackage[];

  @ApiProperty({ description: 'Booking requirements (e.g. Safety Gear)' })
  @Column({ type: 'simple-array', nullable: true })
  requirements?: string[];

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;
}
