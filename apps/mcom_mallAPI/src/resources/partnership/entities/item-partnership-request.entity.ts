import { Column, Entity, ManyToOne, CreateDateColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Service } from '../../services/entities/service.entity';
import { PartnershipStatus } from '../partnership-status.enum';
import { UserPartnership } from './user-partnership.entity';

@Entity('item_partnership_requests')
export class ItemPartnershipRequest extends AbstractBaseEntity {
  @ManyToOne(() => UserPartnership, { nullable: true })
  partnership: UserPartnership;

  @ManyToOne(() => User)
  proposer: User;

  @ManyToOne(() => User)
  receiver: User;

  // Base Item (Owned by Proposer)
  @ManyToOne(() => Product, { nullable: true })
  baseProduct?: Product;

  @ManyToOne(() => Service, { nullable: true })
  baseService?: Service;

  // Plus Item (Owned by Partner)
  @ManyToOne(() => Product, { nullable: true })
  plusProduct?: Product;

  @ManyToOne(() => Service, { nullable: true })
  plusService?: Service;

  @Column({
    type: 'enum',
    enum: PartnershipStatus,
    default: PartnershipStatus.PENDING,
  })
  status: PartnershipStatus;

  @Column({ nullable: true })
  rejectionMessage?: string;

  @CreateDateColumn()
  sentAt: Date;

  @Column({ nullable: true })
  acceptedAt?: Date;

  @Column({ nullable: true })
  rejectedAt?: Date;
}
