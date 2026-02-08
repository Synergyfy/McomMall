import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Promotion } from './promotion.entity';
import { PromotionParticipant } from './promotion-participant.entity';

@Entity('promotion_activities')
export class PromotionActivity extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Promotion)
  promotion: Promotion;

  @ManyToOne(
    () => PromotionParticipant,
    (participant) => participant.activities,
  )
  participant: PromotionParticipant;

  @Column({ type: 'int' })
  pointsEarned: number;
}
