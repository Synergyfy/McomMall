import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RentalBooking } from 'src/resources/booking/entities/rental-booking.entity';
import { ServiceBooking } from 'src/resources/booking/entities/service-booking.entity';
import { Repository } from 'typeorm';

export interface BookingsPaginationDto {
  page?: number;
  limit?: number;
  status?: string;
}

@Injectable()
export class AdminBookingsService {
  constructor(
    @InjectRepository(RentalBooking)
    private rentalBookingRepository: Repository<RentalBooking>,
    @InjectRepository(ServiceBooking)
    private serviceBookingRepository: Repository<ServiceBooking>,
  ) {}

  async findAll(query: BookingsPaginationDto = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, query.limit || 25);
    const skip = (page - 1) * limit;

    const serviceWhere: Record<string, any> = {};
    if (query.status && query.status !== 'all') {
      serviceWhere.status = query.status;
    }

    const [serviceBookings, serviceTotal] = await this.serviceBookingRepository.findAndCount({
      where: serviceWhere,
      relations: ['user', 'service', 'service.business', 'payment'],
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      serviceBookings,
      meta: {
        page,
        limit,
        total: serviceTotal,
        totalPages: Math.ceil(serviceTotal / limit),
      },
    };
  }
}
