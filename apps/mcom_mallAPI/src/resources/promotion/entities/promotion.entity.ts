import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { Product } from '../../product/entities/product.entity';
import { PromotionScope, PromotionType } from '../promotion.enum';
import { PromotionParticipant } from './promotion-participant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('promotions')
export class Promotion extends AbstractBaseEntity {
  @ManyToOne(() => User, (user) => user.promotions)
  user: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  beginDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: PromotionType })
  promotionType: PromotionType;

  @Column({ type: 'enum', enum: PromotionScope, nullable: true })
  promotionScope: PromotionScope;

  @Column({ type: 'int', nullable: true })
  multiplier: number;

  @Column({ type: 'int', nullable: true })
  bonusPoints: number;

  @Column({ type: 'int', nullable: true })
  limitPerCustomer: number;

  @Column({ type: 'decimal' })
  minimumSpend: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @ManyToMany(() => Business, (business) => business.promotions)
  @JoinTable({
    name: 'promotion_businesses',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'business_id', referencedColumnName: 'id' },
  })
  businesses: Business[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'promotion_included_products',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  includedProducts: Product[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'promotion_excluded_products',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  excludedProducts: Product[];

  @OneToMany(
    () => PromotionParticipant,
    (promotionParticipant) => promotionParticipant.promotion,
  )
  participants: PromotionParticipant[];
}
