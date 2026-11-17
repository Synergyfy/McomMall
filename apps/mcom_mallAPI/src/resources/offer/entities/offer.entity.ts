import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Product } from '../../product/entities/product.entity';
import { RewardCouponType } from '../offer.enum';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

@Entity('offers')
export class Offer extends AbstractBaseEntity {
  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'timestamp', nullable: true })
  beginDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: RewardCouponType,
  })
  rewardCouponType: RewardCouponType;

  @Column({ type: 'int', nullable: true })
  limitUsageToXProducts: number;

  @Column({ type: 'int', nullable: true })
  expireAfterXDays: number;

  @Column({ type: 'boolean', default: false })
  allowFreeShipping: boolean;

  @Column({ type: 'boolean', default: false })
  individualUseOnly: boolean;

  @Column({ type: 'boolean', default: false })
  excludeSaleItems: boolean;

  @Column({ type: 'int', nullable: true })
  limitPerCustomer: number;

  @Column({ type: 'boolean', default: false })
  allowLimitToReset: boolean;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  discountAmount: number;

  @Column({ type: 'int', nullable: true })
  discountPercentage: number;

  @Column({ type: 'int', nullable: true })
  bonusPoints: number;

  /** Marks bonus-point offers created through the Time Bonus flow. */
  @Column({ default: false })
  isTimeBonus: boolean;

  @ManyToOne(() => Product, { nullable: true })
  freeProduct: Product;

  @ManyToMany(() => Product, { cascade: true })
  @JoinTable({
    name: 'offer_included_products',
    joinColumn: { name: 'offerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  includedProducts: Product[];

  @ManyToMany(() => Product, { cascade: true })
  @JoinTable({
    name: 'offer_excluded_products',
    joinColumn: { name: 'offerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  excludedProducts: Product[];

  @OneToMany(() => Transaction, (transaction) => transaction.offer)
  transactions: Transaction[];
}
