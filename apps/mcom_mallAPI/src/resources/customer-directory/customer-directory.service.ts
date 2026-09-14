import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Review } from '../reviews/entities/review.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { InterestSignal } from '../interest-signals/entities/interest-signal.entity';
import { Business } from '../listings/entities/listing.entity';
import { CustomerSegment } from './entities/customer-segment.entity';
import {
  CreateCustomerSegmentDto,
  UpdateCustomerSegmentDto,
} from './dto/customer-segment.dto';

export type CustomerCategory =
  | 'nearby'
  | 'returning'
  | 'loyalty'
  | 'borough'
  | 'all';

interface DirectoryFilters {
  search?: string;
  category?: CustomerCategory;
  segment?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class CustomerDirectoryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ServiceBooking)
    private readonly bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(PromotionParticipant)
    private readonly participantRepository: Repository<PromotionParticipant>,
    @InjectRepository(InterestSignal)
    private readonly signalRepository: Repository<InterestSignal>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(CustomerSegment)
    private readonly segmentRepository: Repository<CustomerSegment>,
  ) {}

  private async findServiceIdsForBusiness(
    businessId: string,
  ): Promise<string[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['services'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    return (business.services ?? []).map((service) => service.id);
  }

  private async collectBookingCustomers(
    businessId: string,
  ): Promise<Map<string, { lastVisit: Date; category: CustomerCategory }>> {
    const serviceIds = await this.findServiceIdsForBusiness(businessId);
    if (serviceIds.length === 0) {
      return new Map();
    }

    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.service', 'service')
      .where('service.id IN (:...serviceIds)', { serviceIds })
      .andWhere('booking.user IS NOT NULL')
      .getMany();

    const result = new Map<
      string,
      { lastVisit: Date; category: CustomerCategory }
    >();
    for (const booking of bookings) {
      const customer = booking.user as User | null;
      if (!customer) continue;
      const existing = result.get(customer.id);
      const bookingDate = booking.startTime ?? booking.created_at;
      if (!existing || bookingDate > existing.lastVisit) {
        result.set(customer.id, {
          lastVisit: bookingDate,
          category: booking.status === 'completed' ? 'returning' : 'nearby',
        });
      }
    }
    return result;
  }

  private async collectReviewCustomers(
    businessId: string,
  ): Promise<Map<string, { lastVisit: Date; category: CustomerCategory }>> {
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.business_id = :businessId', { businessId })
      .andWhere('review.user IS NOT NULL')
      .getMany();

    const result = new Map<
      string,
      { lastVisit: Date; category: CustomerCategory }
    >();
    for (const review of reviews) {
      const customer = review.user as User | null;
      if (!customer) continue;
      const existing = result.get(customer.id);
      if (!existing || review.createdAt > existing.lastVisit) {
        result.set(customer.id, {
          lastVisit: review.createdAt,
          category: 'loyalty',
        });
      }
    }
    return result;
  }

  private async collectParticipantCustomers(
    businessId: string,
  ): Promise<Map<string, { lastVisit: Date; category: CustomerCategory }>> {
    const participants = await this.participantRepository
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('participant.promotion', 'promotion')
      .leftJoin('promotion.businesses', 'business')
      .where('business.id = :businessId', { businessId })
      .andWhere('participant.user IS NOT NULL')
      .getMany();

    const result = new Map<
      string,
      { lastVisit: Date; category: CustomerCategory }
    >();
    for (const participant of participants) {
      const customer = participant.user as User | null;
      if (!customer) continue;
      const existing = result.get(customer.id);
      if (!existing || participant.created_at > existing.lastVisit) {
        result.set(customer.id, {
          lastVisit: participant.created_at,
          category: 'loyalty',
        });
      }
    }
    return result;
  }

  async getDirectory(
    businessId: string,
    filters: DirectoryFilters,
  ): Promise<{ customers: any[]; total: number }> {
    const [bookingMap, reviewMap, participantMap] = await Promise.all([
      this.collectBookingCustomers(businessId),
      this.collectReviewCustomers(businessId),
      this.collectParticipantCustomers(businessId),
    ]);

    // Merge customer engagement data keyed by user id
    const engagement = new Map<
      string,
      { lastVisit: Date; category: CustomerCategory }
    >();
    const merge = (
      map: Map<string, { lastVisit: Date; category: CustomerCategory }>,
    ) => {
      for (const [userId, data] of map) {
        const existing = engagement.get(userId);
        if (!existing || data.lastVisit > existing.lastVisit) {
          engagement.set(userId, data);
        }
      }
    };
    merge(bookingMap);
    merge(reviewMap);
    merge(participantMap);

    const userIds = Array.from(engagement.keys());
    if (userIds.length === 0) {
      return { customers: [], total: 0 };
    }

    // Batch fetch all users in a single query with points
    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });

    const segments = await this.segmentRepository.find({
      where: { businessId },
    });

    let customers = users.map((user) => {
      const data = engagement.get(user.id);
      return {
        id: user.id,
        name: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.profilePictureUrl ?? null,
        points: user.points,
        status: this.resolveStatus(user),
        engagement: this.resolveEngagement(user, data?.lastVisit),
        category: data?.category ?? 'all',
        lastVisit: data?.lastVisit ?? null,
        segments: segments
          .filter(
            (segment) =>
              segment.type === this.resolveStatus(user)?.toLowerCase(),
          )
          .map((segment) => segment.name),
        trustScore: user.trustScore,
      };
    });

    // Apply filters
    if (filters.search) {
      const q = filters.search.toLowerCase();
      customers = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(q) ||
          (customer.email ?? '').toLowerCase().includes(q),
      );
    }

    if (filters.category && filters.category !== 'all') {
      customers = customers.filter(
        (customer) => customer.category === filters.category,
      );
    }

    const total = customers.length;

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    customers = customers.slice(offset, offset + limit);

    return { customers, total };
  }

  private resolveStatus(user: User): string {
    if (user.points >= 1000) return 'Platinum Status';
    if (user.points >= 500) return 'Gold Status';
    if (user.points >= 150) return 'Silver Status';
    return 'New';
  }

  private resolveEngagement(user: User, lastVisit?: Date): string {
    if (!lastVisit) return 'Low';
    const days = (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);
    if (days < 7) return 'High';
    if (days < 30) return 'Medium';
    return 'Low';
  }

  async getCustomerDetail(
    businessId: string,
    customerId: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: customerId },
    });
    if (!user) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const [bookings, reviews, participants, signals] = await Promise.all([
      this.bookingRepository.find({
        where: { user: { id: customerId } },
        relations: ['service'],
        order: { created_at: 'DESC' },
      }),
      this.reviewRepository.find({
        where: { user: { id: customerId }, business: { id: businessId } },
        order: { createdAt: 'DESC' },
      }),
      this.participantRepository.find({
        where: { user: { id: customerId } },
        relations: ['promotion'],
        order: { created_at: 'DESC' },
      }),
      this.signalRepository.find({
        where: { businessId },
        order: { createdAt: 'DESC' },
        take: 20,
      }),
    ]);

    const totalSpend = bookings.reduce(
      (sum, booking) => sum + (booking.totalAmount ?? 0),
      0,
    );

    return {
      id: user.id,
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.profilePictureUrl ?? null,
      points: user.points,
      trustScore: user.trustScore,
      membership: user.membership ?? null,
      status: this.resolveStatus(user),
      engagement: this.resolveEngagement(user, bookings[0]?.created_at),
      lastVisit: bookings[0]?.created_at ?? null,
      totalSpend,
      bookingsCount: bookings.length,
      reviewsCount: reviews.length,
      recentBookings: bookings.slice(0, 10),
      reviews: reviews.slice(0, 10),
      promotionParticipations: participants.slice(0, 10),
      interestSignals: signals,
    };
  }

  async getActivityFeed(businessId: string, limit = 50): Promise<any[]> {
    const [bookings, reviews, signals] = await Promise.all([
      this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.user', 'user')
        .leftJoinAndSelect('booking.service', 'service')
        .where('service.businessId = :businessId', { businessId })
        .andWhere('booking.user IS NOT NULL')
        .orderBy('booking.created_at', 'DESC')
        .take(limit)
        .getMany(),
      this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.user', 'user')
        .where('review.business_id = :businessId', { businessId })
        .orderBy('review.created_at', 'DESC')
        .take(limit)
        .getMany(),
      this.signalRepository.find({
        where: { businessId },
        order: { createdAt: 'DESC' },
        take: limit,
      }),
    ]);

    const activities = [
      ...bookings.map((booking) => ({
        type: 'booking',
        customer: booking.user
          ? `${booking.user.firstName} ${booking.user.lastName}`
          : 'Guest',
        message: `New ${booking.status} booking for ${booking.service?.name ?? 'service'}`,
        timestamp: booking.created_at,
      })),
      ...reviews.map((review) => ({
        type: 'review',
        customer: review.user
          ? `${review.user.firstName} ${review.user.lastName}`
          : 'Guest',
        message: `Left a ${review.rating}-star review`,
        timestamp: review.createdAt,
      })),
      ...signals.map((signal) => ({
        type: 'interest',
        customer: 'Anonymous visitor',
        message: `Showed interest in "${signal.signalType}"`,
        timestamp: signal.createdAt,
      })),
    ];

    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return activities.slice(0, limit);
  }

  async findAllSegments(businessId: string): Promise<CustomerSegment[]> {
    return this.segmentRepository.find({
      where: { businessId },
      order: { created_at: 'DESC' },
    });
  }

  async createSegment(dto: CreateCustomerSegmentDto): Promise<CustomerSegment> {
    const segment = this.segmentRepository.create(dto);
    return this.segmentRepository.save(segment);
  }

  async updateSegment(
    id: string,
    dto: UpdateCustomerSegmentDto,
  ): Promise<CustomerSegment> {
    const segment = await this.segmentRepository.findOne({ where: { id } });
    if (!segment) {
      throw new NotFoundException(`Customer segment with ID ${id} not found`);
    }
    Object.assign(segment, dto);
    return this.segmentRepository.save(segment);
  }

  async removeSegment(id: string): Promise<void> {
    const segment = await this.segmentRepository.findOne({ where: { id } });
    if (!segment) {
      throw new NotFoundException(`Customer segment with ID ${id} not found`);
    }
    await this.segmentRepository.remove(segment);
  }
}
