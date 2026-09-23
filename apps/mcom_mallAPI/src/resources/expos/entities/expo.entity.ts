import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Borough } from '../../boroughs/entities/borough.entity';

export enum ExpoStatus {
  PLANNING = 'planning',
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Entity('expos')
export class Expo extends AbstractBaseEntity {
  @ApiProperty({ example: 'Summer Night Market' })
  @Column()
  @Index()
  name: string;

  @ApiPropertyOptional({ example: 'Night market with 40+ local traders.' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({ example: 'Camden Lock Plaza' })
  @Column({ nullable: true })
  venue?: string;

  @ApiProperty({ enum: ExpoStatus, example: ExpoStatus.UPCOMING })
  @Column({ type: 'enum', enum: ExpoStatus, default: ExpoStatus.PLANNING })
  @Index()
  status: ExpoStatus;

  @ApiPropertyOptional({ example: '2026-07-01T18:00:00Z' })
  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-07-03T23:00:00Z' })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Host borough UUID' })
  @Column({ type: 'uuid', nullable: true })
  boroughId?: string | null;

  @ManyToOne(() => Borough, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'boroughId' })
  borough?: Borough | null;
}
