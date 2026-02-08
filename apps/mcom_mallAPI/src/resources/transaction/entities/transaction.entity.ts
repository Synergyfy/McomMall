import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offer/entities/offer.entity';

@Entity('transactions')
export class Transaction extends AbstractBaseEntity {
  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @ManyToOne(() => Offer, (offer) => offer.transactions)
  offer: Offer;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountAmount: number;
}
