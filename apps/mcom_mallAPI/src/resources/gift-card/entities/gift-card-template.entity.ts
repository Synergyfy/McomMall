import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { moneyArrayTransformer, moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { GiftCard } from './gift-card.entity';
import { Expose } from 'class-transformer';

@Entity('gift_card_templates')
export class GiftCardTemplate extends AbstractBaseEntity {
  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Expose()
  @Column({ nullable: true })
  backgroundImageUrl: string;

  @Expose()
  @Column({ nullable: true })
  backgroundColor: string;

  @Expose()
  @Column({ nullable: true })
  textColor: string;

  @Expose()
  @Column({ type: 'bigint', array: true, nullable: true, transformer: moneyArrayTransformer })
  fixedAmounts: number[];

  @Expose()
  @Column({ default: false })
  allowCustomAmount: boolean;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  minCustomAmount: number;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  maxCustomAmount: number;

  @Expose()
  @Column({ nullable: true, comment: 'Expiry period in days from purchase' })
  expiryPeriodDays: number;

  @Expose()
  @Expose()
  @Column({ default: true })
  isActive: boolean;

  @Expose()
  @Column({ default: false })
  allowReloading: boolean;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  bonusThreshold: number;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  bonusAmount: number;

  /**
   * Optional restriction inherited by partner instruments. Shape mirrors an
   * instrument scope (`mode`, `businessId`, `listingIds`, `productIds`,
   * `serviceIds`).
   */
  @Expose()
  @Column({ name: 'scope_config', type: 'jsonb', nullable: true })
  scopeConfig: Record<string, any> | null;

  @Expose()
  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl?: string | null;

  /** Merchant-defined spending locations (business/listings/products/services). */
  @Expose()
  @Column({ name: 'spending_locations', type: 'jsonb', nullable: true })
  spendingLocations?: Record<string, any>[] | null;

  @Expose()
  @Column({ name: 'preview_svg', type: 'text', nullable: true })
  previewSvg?: string | null;

  @Expose()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Expose()
  @Column()
  ownerId: string;

  @OneToMany(() => GiftCard, (giftCard) => giftCard.template)
  giftCards: GiftCard[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
