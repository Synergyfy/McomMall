import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export type TakeadsSyncRunType =
  | 'merchants'
  | 'coupons'
  | 'reports'
  | 'resolve';
export type TakeadsSyncRunStatus = 'running' | 'success' | 'failed';

@Entity('takeads_sync_runs')
export class TakeadsSyncRun extends AbstractBaseEntity {
  @Index('IDX_takeads_sync_runs_type')
  @Column({ type: 'varchar', length: 20 })
  type: TakeadsSyncRunType;

  @Column({ type: 'varchar', length: 20, default: 'running' })
  status: TakeadsSyncRunStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt?: Date | null;

  @Column({ type: 'int', default: 0 })
  itemsReceived: number;

  @Column({ type: 'int', default: 0 })
  itemsCreated: number;

  @Column({ type: 'int', default: 0 })
  itemsUpdated: number;

  @Column({ type: 'int', default: 0 })
  itemsFailed: number;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  watermark?: string | null;
}
