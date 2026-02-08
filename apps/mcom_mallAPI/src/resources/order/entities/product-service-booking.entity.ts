import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { ServiceBooking } from '../../booking/entities/service-booking.entity';
import { Product } from '../../product/entities/product.entity';
import { Partnership } from '../../partnership/entities/partnership.entity';

@Entity()
export class ProductServiceBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.productServiceBookings)
  order: Order;

  @OneToOne(() => ServiceBooking, serviceBooking => serviceBooking.productServiceBooking)
  @JoinColumn()
  serviceBooking: ServiceBooking;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => Partnership, partnership => partnership.productServiceBookings)
  partnership: Partnership;
}