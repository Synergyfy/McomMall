import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Product } from '../../product/entities/product.entity';
import { Service } from '../../services/entities/service.entity';
import { User } from '../../users/entities/user.entity';
import { PartnershipRequestStatus } from '../partnership.enum';

@Entity('partnership_requests')
export class PartnershipRequest extends AbstractBaseEntity {
  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => Service)
  service: Service;

  @ManyToOne(() => User)
  requestingUser: User; // User who owns the product

  @ManyToOne(() => User)
  serviceOwner: User; // User who owns the service

  @Column({
    type: 'enum',
    enum: PartnershipRequestStatus,
    default: PartnershipRequestStatus.PENDING,
  })
  status: PartnershipRequestStatus;
}