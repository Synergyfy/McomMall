import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { PlanType } from '../enums/plan-type.enum';
import { PaygOption } from '../enums/payg-option.enum';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';

@Entity('payment_histories')
export class PaymentHistory extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @Column({ type: 'varchar', length: 8, default: 'gbp' })
  currency: string;

  @Column({ type: 'varchar', length: 128 })
  transactionId: string;

  @Column({ type: 'enum', enum: PlanType, nullable: true })
  planType: PlanType;

  @Column({ type: 'enum', enum: PaygOption, nullable: true })
  paygOption: PaygOption;

  @Column({
    type: 'enum',
    enum: PaymentPurpose,
    default: PaymentPurpose.MEMBERSHIP,
  })
  purpose: PaymentPurpose;

  @Column({ nullable: true })
  tierId: string;

  @Column({ type: 'enum', enum: PaymentGateway })
  paymentGateway: PaymentGateway;
}
