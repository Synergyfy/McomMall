import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { BookingStatus } from './booking.enum';
import { ServicePayment } from './service-payment.entity';
import { ProductServiceBooking } from '../../order/entities/product-service-booking.entity';

@Entity('service_bookings')
export class ServiceBooking extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Service)
  service: Service;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @OneToOne(() => ServicePayment, (payment) => payment.booking, {
    nullable: true,
  })
  @JoinColumn()
  payment: ServicePayment;

  @Column({ default: false })
  businessOwnerCompleted: boolean;

  @Column({ default: false })
  customerCompleted: boolean;

  @OneToOne(
    () => ProductServiceBooking,
    (productServiceBooking) => productServiceBooking.serviceBooking,
  )
  productServiceBooking: ProductServiceBooking;
}
