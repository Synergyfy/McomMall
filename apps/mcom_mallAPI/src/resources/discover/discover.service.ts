import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Event } from '../events/entities/event.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { BoroughCampaignsService } from '../visibility/borough-campaigns.service';
import { HighStreetService } from '../visibility/high-street.service';
import { MembershipService } from '../membership/membership.service';
import { WalletService } from '../wallet/wallet.service';

export interface BusinessWithDistance extends Business {
  distance?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class DiscoverService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    private readonly boroughCampaignsService: BoroughCampaignsService,
    private readonly highStreetService: HighStreetService,
    private readonly membershipService: MembershipService,
    private readonly walletService: WalletService,
  ) {}

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)} km`;
  }

  async getHomeFeed(userId: string | undefined, query: any) {
    const [businesses, promotions, events, rewards] = await Promise.all([
      this.getBusinesses(userId, { ...query, tab: 'nearby', limit: 10 }),
      this.getPromotions(userId, { ...query, limit: 5 }),
      this.getEvents(userId, { ...query, tab: 'upcoming', limit: 4 }),
      this.getRewards(userId, { ...query, tab: 'available', limit: 5 }),
    ]);

    return {
      businesses: businesses.items || businesses,
      promotions: promotions.items || promotions,
      events: events.items || events,
      rewards: rewards.items || rewards,
    };
  }

  async getBusinesses(userId: string | undefined, query: any) {
    const { lat, lng, search, tab = 'nearby', page = 1, limit = 10, borough } = query;

    const qb = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.sector', 'sector')
      .leftJoinAndSelect('business.category', 'category')
      .leftJoinAndSelect('business.businessHours', 'businessHours')
      .leftJoinAndSelect('business.location', 'location')
      .where('business.status = :status', { status: 'PUBLISHED' });

    if (search) {
      qb.andWhere(
        '(business.businessName ILIKE :search OR business.shortDescription ILIKE :search OR sector.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (borough) {
      qb.andWhere('business.borough = :borough', { borough });
    }

    const [items, total] = await qb
      .orderBy('business.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    let businessesWithDistance = items as BusinessWithDistance[];

    if (lat && lng) {
      businessesWithDistance = items.map((business) => {
        const bizLat = business.location?.latitude;
        const bizLng = business.location?.longitude;
        if (bizLat && bizLng) {
          const distanceKm = this.calculateDistance(lat, lng, bizLat, bizLng);
          return { ...business, distance: this.formatDistance(distanceKm), latitude: bizLat, longitude: bizLng };
        }
        return { ...business, distance: 'Unknown' };
      });

      if (tab === 'nearby') {
        businessesWithDistance.sort((a, b) => {
          const distA = a.distance ? parseFloat(a.distance.replace(' km', '')) : 999;
          const distB = b.distance ? parseFloat(b.distance.replace(' km', '')) : 999;
          return distA - distB;
        });
      }
    }

    return {
      items: businessesWithDistance,
      meta: {
        totalItems: total,
        itemCount: businessesWithDistance.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async getEvents(userId: string | undefined, query: any) {
    const { tab = 'upcoming', lat, lng, borough, page = 1, limit = 6, joinedIds, savedIds } = query;

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.business', 'business')
      .leftJoinAndSelect('business.location', 'businessLocation')
      .leftJoinAndSelect('event.voucherProduct', 'voucherProduct')
      .where('event.status != :status', { status: 'cancelled' });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    switch (tab) {
      case 'live':
        qb.andWhere('DATE(event.startDate) = :today', { today: todayStr });
        break;
      case 'upcoming':
        qb.andWhere('event.startDate >= :today', { today: todayStr });
        qb.orderBy('event.startDate', 'ASC');
        break;
      case 'joined':
        if (joinedIds) {
          const ids = joinedIds.split(',').filter(Boolean);
          qb.andWhere('event.id IN (:...ids)', { ids });
        } else {
          return { items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit, totalPages: 0, currentPage: page } };
        }
        break;
      case 'recommended':
        qb.orderBy('RANDOM()');
        break;
      case 'nearby':
        qb.orderBy('event.startDate', 'ASC');
        break;
      case 'borough':
        if (borough && borough !== 'All') {
          qb.andWhere('business.borough = :borough', { borough });
        }
        qb.orderBy('event.startDate', 'ASC');
        break;
      default:
        qb.orderBy('event.startDate', 'ASC');
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    let eventsWithDistance: any[] = items;
    if (lat && lng) {
      eventsWithDistance = items.map((event) => {
        const eventLat = event.business?.location?.latitude;
        const eventLng = event.business?.location?.longitude;
        if (eventLat && eventLng) {
          const distanceKm = this.calculateDistance(lat, lng, eventLat, eventLng);
          return { ...event, distance: this.formatDistance(distanceKm) };
        }
        return { ...event, distance: 'Unknown' };
      });

      if (tab === 'nearby') {
        eventsWithDistance.sort((a, b) => {
          const distA = a.distance ? parseFloat(a.distance.replace(' km', '')) : 999;
          const distB = b.distance ? parseFloat(b.distance.replace(' km', '')) : 999;
          return distA - distB;
        });
      }
    }

    const joinedSet = new Set(joinedIds?.split(',').filter(Boolean) || []);
    const savedSet = new Set(savedIds?.split(',').filter(Boolean) || []);

    return {
      items: eventsWithDistance.map((event) => ({
        ...event,
        isJoined: joinedSet.has(event.id),
        isSaved: savedSet.has(event.id),
      })),
      meta: {
        totalItems: total,
        itemCount: eventsWithDistance.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async getPromotions(userId: string | undefined, query: any) {
    const { limit = 5 } = query;

    const promotions = await this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.businesses', 'businesses')
      .where('promotion.isActive = :isActive', { isActive: true })
      .andWhere('promotion.startDate <= :now', { now: new Date() })
      .andWhere('promotion.endDate >= :now', { now: new Date() })
      .orderBy('promotion.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return {
      items: promotions,
      meta: { totalItems: promotions.length, itemCount: promotions.length, itemsPerPage: limit, totalPages: 1, currentPage: 1 },
    };
  }

  async getRewards(userId: string | undefined, query: any) {
    const { tab = 'available', page = 1, limit = 10 } = query;

    if (!userId) {
      return { items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit, totalPages: 0, currentPage: page } };
    }

    try {
      if (tab === 'my-points') {
        const wallet = await this.walletService.getWallet(userId);
        return {
          items: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: limit,
            totalPages: 1,
            currentPage: page,
            points: wallet?.balance || 0,
            breakdown: { earned: 0, used: 0, pending: 0 },
          },
        };
      }

      if (tab === 'loyalty') {
        return {
          items: [],
          meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit, totalPages: 0, currentPage: page },
        };
      }

      if (tab === 'expiring') {
        return { items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit, totalPages: 0, currentPage: page } };
      }

      if (tab === 'redeemed') {
        return { items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit, totalPages: 0, currentPage: page } };
      }

      // available
      const promotions = await this.promotionRepository
        .createQueryBuilder('promotion')
        .leftJoinAndSelect('promotion.businesses', 'businesses')
        .where('promotion.isActive = :isActive', { isActive: true })
        .andWhere('promotion.endDate >= :now', { now: new Date() })
        .take(limit)
        .getMany();

      return {
        items: promotions,
        meta: { totalItems: promotions.length, itemCount: promotions.length, itemsPerPage: limit, totalPages: 1, currentPage: page },
      };
    } catch (error) {
      return { items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit, totalPages: 0, currentPage: page } };
    }
  }

  async getBoroughCampaigns(userId: string | undefined, borough?: string) {
    try {
      const campaigns = await this.boroughCampaignsService.findAll();
      if (borough) {
        return campaigns.filter((c: any) => c.borough === borough);
      }
      return campaigns;
    } catch (error) {
      return [];
    }
  }

  async getHighStreet(userId: string | undefined, borough?: string) {
    try {
      if (borough) {
        return this.highStreetService.getNeighborhoodVitality(borough);
      }
      return [];
    } catch (error) {
      return [];
    }
  }
}
