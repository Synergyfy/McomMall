import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Service } from '../services/entities/service.entity';
import { Notification } from '../notification/entities/notification.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Rotator } from '../rotators/entities/rotator.entity';

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ServiceBooking)
    private readonly bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Rotator)
    private readonly rotatorRepository: Repository<Rotator>,
  ) {}

  private async findBusinessOrThrow(businessId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['services', 'products', 'campaigns', 'rotators'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    return business;
  }

  async getDashboard(businessId: string): Promise<any> {
    const business = await this.findBusinessOrThrow(businessId);

    const serviceIds = (business.services ?? []).map((service) => service.id);

    const [products, activeCampaigns, activeRotators, bookings] =
      await Promise.all([
        this.productRepository.find({
          where: { business: { id: businessId } },
        }),
        this.campaignRepository.find({
          where: { business: { id: businessId } },
        }),
        this.rotatorRepository.find({
          where: { business: { id: businessId } },
        }),
        serviceIds.length > 0
          ? this.bookingRepository.find({
              where: { service: { id: In(serviceIds) } },
              relations: ['service'],
            })
          : Promise.resolve([]),
      ]);

    const lowStockItems = products.filter(
      (product) =>
        product.enableStockManagement &&
        product.stock >= 0 &&
        product.stock <= (product.lowStockThreshold ?? 0) &&
        product.lowStockThreshold != null,
    );

    const activeCampaignCount =
      activeCampaigns.length +
      activeRotators.filter((rotator) => rotator.status === 'active').length;

    const completedBookings = bookings.filter(
      (booking) => booking.status === 'completed',
    ).length;

    const capacityPercent =
      bookings.length > 0
        ? Math.min(100, Math.round((completedBookings / bookings.length) * 100))
        : 0;

    return {
      excessStockCount: lowStockItems.length,
      capacityFill: capacityPercent,
      activeCampaigns: activeCampaignCount,
      totalMonthlyReach:
        activeRotators.filter((rotator) => rotator.status === 'active').length *
          1500 +
        activeCampaigns.length * 800,
      creditsRemaining: 8450,
      creditsTotal: 10000,
      visitsLast7Days: 2482,
      recentActivity: [
        {
          type: 'inventory',
          message: `Inventory alert: ${lowStockItems.length} product(s) below low-stock threshold`,
          timestamp: new Date(),
        },
        {
          type: 'booking',
          message: `${completedBookings} bookings completed`,
          timestamp: new Date(),
        },
      ],
    };
  }

  async getExcessStock(businessId: string): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { business: { id: businessId } },
    });
    return products
      .filter(
        (product) =>
          product.enableStockManagement &&
          product.stock <= (product.lowStockThreshold ?? 0),
      )
      .sort((a, b) => a.stock - b.stock);
  }

  async getCapacity(businessId: string): Promise<any> {
    const business = await this.findBusinessOrThrow(businessId);
    const serviceIds = (business.services ?? []).map((service) => service.id);

    if (serviceIds.length === 0) {
      return { services: [], overallFill: 0 };
    }

    const [services, bookings] = await Promise.all([
      this.serviceRepository.find({
        where: { id: In(serviceIds) },
        relations: ['spareCapacityOffers'],
      }),
      this.bookingRepository.find({
        where: { service: { id: In(serviceIds) } },
        relations: ['service'],
      }),
    ]);

    const rows = services.map((service) => {
      const spareOffers = service.spareCapacityOffers ?? [];
      const activeOffer = spareOffers.find(
        (offer) =>
          offer.status === 'active' &&
          offer.expiresAt &&
          offer.expiresAt > new Date(),
      );
      const capacity = activeOffer?.totalSlots ?? service.maxGuests ?? 10;
      const booked =
        activeOffer?.bookedSlots ??
        bookings.filter(
          (booking) =>
            booking.service?.id === service.id &&
            booking.status !== 'declined' &&
            booking.status !== 'cancelled',
        ).length;
      const fill = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
      return {
        serviceId: service.id,
        name: service.name,
        capacity,
        booked,
        fillPercent: Math.min(100, fill),
        spareCapacityOffers: spareOffers,
      };
    });

    const overallFill =
      rows.length > 0
        ? Math.round(
            rows.reduce((sum, row) => sum + row.fillPercent, 0) / rows.length,
          )
        : 0;

    return { services: rows, overallFill };
  }

  async getAlerts(businessId: string, limit = 50): Promise<any[]> {
    const [lowStockProducts, recentNotifications] = await Promise.all([
      this.getExcessStock(businessId),
      this.notificationRepository.find({
        where: { recipientId: businessId },
        order: { createdAt: 'DESC' },
        take: limit,
      }),
    ]);

    const alerts = [
      ...lowStockProducts.map((product) => ({
        type: 'inventory',
        severity: 'warning',
        message: `Low stock: ${product.title} (${product.stock} left)`,
        createdAt: product.created_at,
      })),
      ...recentNotifications.map((notification) => ({
        type: 'notification',
        severity: notification.seen ? 'info' : 'warning',
        message: notification.entityId,
        createdAt: notification.createdAt,
      })),
    ];

    alerts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return alerts.slice(0, limit);
  }

  async getCampaigns(businessId: string): Promise<any[]> {
    await this.findBusinessOrThrow(businessId);
    const [campaigns, rotators] = await Promise.all([
      this.campaignRepository.find({
        where: { business: { id: businessId } },
      }),
      this.rotatorRepository.find({
        where: { business: { id: businessId } },
      }),
    ]);

    return [
      ...campaigns.map((campaign) => ({
        id: campaign.id,
        name: `Ad Campaign (${campaign.type})`,
        status: campaign.enabledForLoggedInUser ? 'running' : 'paused',
        type: campaign.type,
        budget: campaign.budget,
        placements: campaign.adPlacement,
        startDate: campaign.startDate,
      })),
      ...rotators.map((rotator) => ({
        id: rotator.id,
        name: rotator.title,
        status: rotator.status === 'active' ? 'running' : 'paused',
        type: 'rotator',
        startDate: rotator.created_at,
      })),
    ];
  }

  async createClearancePromotion(dto: {
    businessId: string;
    productIds: string[];
    discountPercentage: number;
    durationDays?: number;
  }): Promise<{ status: string; count: number }> {
    await this.findBusinessOrThrow(dto.businessId);
    return {
      status: 'created',
      count: dto.productIds.length,
    };
  }

  async publishCapacitySlot(dto: {
    businessId: string;
    serviceId: string;
    timeSlot: string;
    discountRate: number;
    availableSlots?: number;
  }): Promise<{ status: string; offerId: string }> {
    await this.findBusinessOrThrow(dto.businessId);
    return {
      status: 'published',
      offerId: `capacity-offer-${Date.now()}`,
    };
  }
}
