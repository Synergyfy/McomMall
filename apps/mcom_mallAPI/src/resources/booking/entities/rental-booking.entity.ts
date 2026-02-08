import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { BookingStatus } from './booking.enum';
import { ServicePayment } from './service-payment.entity';

@Entity('rental_bookings')
export class RentalBooking extends AbstractBaseEntity {
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

  @OneToOne(() => ServicePayment, (payment) => payment.booking)
  @JoinColumn()
  payment: ServicePayment;
}
