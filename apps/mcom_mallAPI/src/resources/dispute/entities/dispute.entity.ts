import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../listings/entities/listing.entity';
import { Order } from '../../order/entities/order.entity';
import { DisputeReason, DisputeStatus } from '../dispute.enum';

@Entity('disputes')
export class Dispute extends AbstractBaseEntity {
  @ManyToOne(() => User)
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => Business)
  business: Business;

  @Column()
  businessId: string;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: DisputeReason })
  reason: DisputeReason;

  @Column('text')
  description: string;

  @Column('simple-array', { nullable: true })
  evidence: string[];

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.NEW })
  status: DisputeStatus;

  @Column({ nullable: true })
  resolutionNotes: string;

  @Column({ nullable: true })
  resolvedBy: string; // Admin ID or Name

  @Column({ nullable: true })
  resolutionDecision: string; // favor_buyer, favor_seller, split
}
