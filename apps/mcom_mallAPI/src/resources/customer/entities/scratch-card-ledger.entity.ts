import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ScratchPrizeType } from '../reward.enum';

@Entity('scratch_card_ledger')
@Unique(['userId', 'scratchDate'])
export class ScratchCardLedger extends AbstractBaseEntity {
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'date' })
  scratchDate: string;

  @Column({ type: 'enum', enum: ScratchPrizeType })
  prizeType: ScratchPrizeType;

  @Column({ type: 'int', nullable: true })
  prizeValue?: number;

  @Column({ nullable: true })
  prizeLabel?: string;
}
