import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentMethodProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

@Entity('payment_methods')
export class PaymentMethod extends AbstractBaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  @Column({ type: 'enum', enum: PaymentMethodProvider })
  provider: PaymentMethodProvider;

  @Column({ type: 'text' })
  tokenReference: string;

  @Column({ nullable: true })
  brand?: string;

  @Column({ nullable: true })
  last4?: string;

  @Column({ type: 'int', nullable: true })
  expMonth?: number;

  @Column({ type: 'int', nullable: true })
  expYear?: number;

  @Column({ default: true })
  isDefault: boolean;
}
