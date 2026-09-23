import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Borough } from '../../boroughs/entities/borough.entity';

export enum HighStreetStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

@Entity('high_streets')
export class HighStreet extends AbstractBaseEntity {
  @ApiProperty({ example: 'Camden High Street', description: 'High street name' })
  @Column()
  name: string;

  @ApiPropertyOptional({ example: 'Borough market mile with independent traders' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: HighStreetStatus, example: HighStreetStatus.ACTIVE })
  @Column({ type: 'enum', enum: HighStreetStatus, default: HighStreetStatus.PENDING })
  @Index()
  status: HighStreetStatus;

  @ApiPropertyOptional({ example: 51.539, description: 'Latitude for map marker' })
  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ example: -0.142, description: 'Longitude for map marker' })
  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @ApiProperty({ example: true })
  @Column({ default: false })
  hasPhysicalHub: boolean;

  @ApiProperty({ example: true })
  @Column({ default: false })
  hasVirtualHub: boolean;

  @ApiPropertyOptional({ description: 'Owning borough ID' })
  @Column({ type: 'uuid', nullable: true })
  boroughId?: string | null;

  @ManyToOne(() => Borough, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'boroughId' })
  borough?: Borough | null;
}
