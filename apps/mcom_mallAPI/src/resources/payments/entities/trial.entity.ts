import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export interface TrialTask {
  createdBusiness: boolean;
  createdProductOrService: boolean;
  createdPromotion: boolean;
  createdOffer: boolean;
  createdCoupon: boolean;
}

export interface TrialPause {
  pausedAt: Date;
  resumedAt: Date | null;
}

@Entity('trials')
export class Trial extends AbstractBaseEntity {
  @OneToOne(() => User, (user) => user.trial)
  @JoinColumn()
  user: User;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'jsonb', default: [] })
  pauses: TrialPause[];

  @Column({
    type: 'jsonb',
    default: {
      createdBusiness: false,
      createdProductOrService: false,
      createdPromotion: false,
      createdOffer: false,
      createdCoupon: false,
    },
  })
  tasks: TrialTask;
}
