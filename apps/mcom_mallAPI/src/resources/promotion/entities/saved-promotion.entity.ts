import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Promotion } from './promotion.entity';

@Entity('saved_promotions')
@Index('UQ_saved_promotions_user_promotion', ['userId', 'promotionId'], {
  unique: true,
})
export class SavedPromotion extends AbstractBaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  promotionId: string;

  @ManyToOne(() => Promotion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotionId' })
  promotion: Promotion;
}
