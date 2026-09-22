import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

export enum MissionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('quality_missions')
export class QualityMission extends AbstractBaseEntity {
  @ApiProperty({ description: 'Business under review' })
  @Column({ type: 'uuid' })
  @Index()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @ApiProperty({ example: 'Agent 47', description: 'Mystery shopper codename' })
  @Column()
  shopperName: string;

  @ApiProperty({ enum: MissionStatus, example: MissionStatus.PENDING })
  @Column({ type: 'enum', enum: MissionStatus, default: MissionStatus.PENDING })
  @Index()
  status: MissionStatus;

  @ApiPropertyOptional({ example: 4.8, description: 'Score out of 5' })
  @Column({ type: 'float', nullable: true })
  score?: number;

  @ApiPropertyOptional({ example: 'Staff were attentive; checkout took 2 minutes.' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ example: '2026-03-01T10:00:00Z' })
  @Column({ type: 'timestamp', nullable: true })
  scheduledFor?: Date;
}
