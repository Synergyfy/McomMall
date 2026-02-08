import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Product } from '../../product/entities/product.entity';
import { Service } from '../../services/entities/service.entity';
import { PartnershipRequest } from './partnership-request.entity';
import { ProductServiceBooking } from '../../order/entities/product-service-booking.entity';

@Entity('partnerships')
export class Partnership extends AbstractBaseEntity {
  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => Service)
  service: Service;

  @OneToOne(() => PartnershipRequest)
  partnershipRequest: PartnershipRequest;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ProductServiceBooking, productServiceBooking => productServiceBooking.partnership)
  productServiceBookings: ProductServiceBooking[];
}