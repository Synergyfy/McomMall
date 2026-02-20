import { Column, Entity, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Product } from '../../product/entities/product.entity';
import { Service } from '../../services/entities/service.entity';
import { ItemPartnershipRequest } from './item-partnership-request.entity';
import { ProductServiceBooking } from '../../order/entities/product-service-booking.entity';

@Entity('partnerships')
export class Partnership extends AbstractBaseEntity {
  @ManyToOne(() => Product, { nullable: true })
  baseProduct?: Product;

  @ManyToOne(() => Service, { nullable: true })
  baseService?: Service;

  @ManyToOne(() => Product, { nullable: true })
  plusProduct?: Product;

  @ManyToOne(() => Service, { nullable: true })
  plusService?: Service;

  @OneToOne(() => ItemPartnershipRequest)
  @JoinColumn()
  itemPartnershipRequest: ItemPartnershipRequest;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ProductServiceBooking, productServiceBooking => productServiceBooking.partnership)
  productServiceBookings: ProductServiceBooking[];
}
