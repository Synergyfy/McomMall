import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ServiceBooking } from './entities/service-booking.entity';

@Injectable()
export class ServiceBookingRepository extends Repository<ServiceBooking> {
  constructor(private dataSource: DataSource) {
    super(ServiceBooking, dataSource.createEntityManager());
  }
}
