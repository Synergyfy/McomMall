import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
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
  @Column({ type: 'decimal', array: true, nullable: true })
  fixedAmounts: number[];

  @Expose()
  @Column({ default: false })
  allowCustomAmount: boolean;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minCustomAmount: number;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
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
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bonusThreshold: number;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bonusAmount: number;

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