import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RentalBooking } from 'src/resources/booking/entities/rental-booking.entity';
import { ServiceBooking } from 'src/resources/booking/entities/service-booking.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminBookingsService {
  constructor(
    @InjectRepository(RentalBooking)
    private rentalBookingRepository: Repository<RentalBooking>,
    @InjectRepository(ServiceBooking)
    private serviceBookingRepository: Repository<ServiceBooking>,
  ) {}

  async findAll() {
    const rentalBookings = await this.rentalBookingRepository.find({
      relations: ['user', 'service', 'service.business'],
    });
    const serviceBookings = await this.serviceBookingRepository.find({
      relations: ['user', 'service', 'service.business'],
    });
    return { rentalBookings, serviceBookings };
  }
}