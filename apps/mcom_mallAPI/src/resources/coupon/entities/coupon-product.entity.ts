import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Expose } from 'class-transformer';
import { Coupon } from './coupon.entity';

@Entity('coupon_products')
export class CouponProduct {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ length: 100 })
  name: string;

  @Expose()
  @Column('text', { nullable: true })
  description: string;

  @Expose()
  @Column('decimal', {
    array: true,
    nullable: true,
    transformer: {
      to: (value: number[]) => value,
      from: (value: string[]) => value?.map(parseFloat),
    },
  })
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
  @Column({ default: true })
  isEnabled: boolean;

  @Expose()
  @Column({ nullable: true })
  expiryDays: number | null;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  backgroundImage: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  textColor: string;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  @DeleteDateColumn()
  deletedAt: Date;

  @Expose()
  @ManyToOne(() => User)
  user: User;

  // @OneToMany(() => Coupon, (coupon) => coupon.couponProduct)
  // coupons: Coupon[];

  @Expose()
  @Column({ default: false })
  allowReloading: boolean;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bonusThreshold: number;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bonusAmount: number;
}