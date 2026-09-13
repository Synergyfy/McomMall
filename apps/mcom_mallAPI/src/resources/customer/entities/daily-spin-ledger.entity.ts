import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { SpinPrizeType } from '../reward.enum';

@Entity('daily_spin_ledger')
@Unique(['userId', 'spinDate'])
export class DailySpinLedger extends AbstractBaseEntity {
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'date' })
  spinDate: string;

  @Column({ type: 'enum', enum: SpinPrizeType })
  prizeType: SpinPrizeType;

  @Column({ type: 'int', nullable: true })
  prizeValue?: number;

  @Column({ type: 'int', default: 0 })
  pointsAwarded: number;
}
