import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Promotion } from './promotion.entity';
import { PromotionActivity } from './promotion-activity.entity';

@Entity('promotion_participants')
export class PromotionParticipant extends AbstractBaseEntity {
  @ManyToOne(() => User, (user) => user.promotionParticipations)
  user: User;

  @ManyToOne(() => Promotion, (promotion) => promotion.participants)
  promotion: Promotion;

  @Column({ type: 'int', default: 0 })
  pointsEarned: number;

  @OneToMany(() => PromotionActivity, (activity) => activity.participant)
  activities: PromotionActivity[];
}
