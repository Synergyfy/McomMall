import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Coupon } from './entities/coupon.entity';
import { CouponStatus, CouponSourceType } from './coupon.enum';
import {
  RedemptionLog,
  RedemptionStatus,
} from './entities/redemption-log.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { MarketingCampaign } from '../campaign/entities/marketing-campaign.entity';
import { Business } from '../listings/entities/listing.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { BrandingAssociation } from './entities/branding-association.entity';
import { User } from '../users/entities/user.entity';
import {
  MarketingCampaignStatus,
  MarketingCampaignType,
} from '../campaign/marketing-campaign.enum';
import { Order } from '../order/entities/order.entity';
import {
  CapabilityService,
  ActionType,
} from '../capability/capability.service';
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';

import { SavedCoupon } from './entities/saved-coupon.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(MarketingCampaign)
    private readonly campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BrandingAssociation)
    private readonly brandingRepository: Repository<BrandingAssociation>,
    @InjectRepository(RedemptionLog)
    private readonly redemptionLogRepository: Repository<RedemptionLog>,
    @InjectRepository(ShippingAddress)
    private readonly addressRepository: Repository<ShippingAddress>,
    @InjectRepository(SavedCoupon)
    private readonly savedCouponRepository: Repository<SavedCoupon>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
  ) { }

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const {
      title,
      description,
      code,
      sourceType,
      discountValue,
      discountType,
      usageLimit,
      perUserLimit,
      startDate: _startDate,
      expiresAt,
      campaignId,
      businessId,
      brandingBusinessId,
    } = dto;

    // Validate Business and Capability
    let business: Business | null = null;
    if (businessId) {
      business = await this.businessRepository.findOne({
        where: { id: businessId },
        relations: ['user'],
      });
      if (!business) throw new NotFoundException('Business not found');

      if (sourceType === CouponSourceType.BUSINESS) {
        await this.capabilityService.checkPermission(
          business.user.id,
          ActionType.CREATE_COUPON_TEMPLATE,
        );
      }
    }

    // Validate Campaign
    let campaign: MarketingCampaign | null = null;
    if (campaignId) {
      campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });
      if (!campaign) throw new NotFoundException('Campaign not found');
    }

    const coupon = this.couponRepository.create({
      title,
      description,
      code,
      sourceType,
      discountValue,
      discountType,
      usageLimit: usageLimit || 0,
      perUserLimit: perUserLimit || 1,
      expiresAt: expiresAt || campaign?.endDate,
      status: CouponStatus.DRAFT,
      campaign,
      business,
    });

    const savedCoupon = await this.couponRepository.save(coupon);

    if (brandingBusinessId) {
      const brandingBusiness = await this.businessRepository.findOne({
        where: { id: brandingBusinessId },
      });
      if (brandingBusiness) {
        const branding = this.brandingRepository.create({
          coupon: savedCoupon,
          business: brandingBusiness,
        });
        await this.brandingRepository.save(branding);
      }
    }

    return savedCoupon;
  }

  async findAll(pagination: PaginationQueryDto): Promise<PageDto<Coupon>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.couponRepository.findAndCount({
      skip,
      take: limit,
      relations: ['campaign', 'business', 'branding', 'branding.business'],
      order: { created_at: 'DESC' },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination as any,
    });

    return new PageDto(items, pageMetaDto);
  }

  async validateCoupon(
    code: string,
    user: User,
    existingCouponCode?: string,
  ): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: [
        'campaign',
        'business',
        'business.user',
        'branding',
        'branding.business',
      ],
    });

    if (!coupon) throw new NotFoundException('Coupon not found');

    if (existingCouponCode && existingCouponCode !== code) {
      throw new BadRequestException('Stacking coupons is not allowed.');
    }

    if (
      coupon.status === CouponStatus.DISABLED ||
      coupon.status === CouponStatus.ARCHIVED ||
      coupon.status === CouponStatus.EXPIRED
    ) {
      throw new BadRequestException('Coupon is not active.');
    }
    if (coupon.status === CouponStatus.DRAFT) {
      throw new BadRequestException('Coupon is not yet active.');
    }

    const now = new Date();
    if (coupon.expiresAt && now > coupon.expiresAt)
      throw new BadRequestException('Coupon has expired.');
    if (coupon.campaign) {
      if (coupon.campaign.endDate && now > coupon.campaign.endDate)
        throw new BadRequestException('Campaign has ended.');
      if (coupon.campaign.startDate && now < coupon.campaign.startDate)
        throw new BadRequestException('Campaign has not started yet.');
      if (coupon.campaign.status !== MarketingCampaignStatus.ACTIVE)
        throw new BadRequestException('Campaign is not active.');

      if (
        coupon.campaign.type === MarketingCampaignType.HYPERLOCAL &&
        coupon.campaign.targetPostalCodes?.length > 0
      ) {
        const userAddress = await this.addressRepository.findOne({
          where: { user: { id: user.id }, isMain: true },
        });
        if (!userAddress || !userAddress.postalCode) {
          throw new BadRequestException(
            'A valid shipping address with postal code is required for this hyperlocal offer.',
          );
        }

        const normalizedUserCode = userAddress.postalCode
          .toUpperCase()
          .replace(/\s/g, '');
        const isMatch = coupon.campaign.targetPostalCodes.some((target) => {
          const normalizedTarget = target.toUpperCase().replace(/\s/g, '');
          return normalizedUserCode.startsWith(normalizedTarget);
        });

        if (!isMatch)
          throw new BadRequestException(
            'This coupon is not available in your area.',
          );
      }
    }

    if (coupon.usageLimit > 0) {
      const totalRedemptions = await this.redemptionLogRepository.count({
        where: { coupon: { id: coupon.id }, status: RedemptionStatus.REDEEMED },
      });
      if (totalRedemptions >= coupon.usageLimit)
        throw new BadRequestException('Coupon usage limit reached.');
    }

    const userRedemptions = await this.redemptionLogRepository.count({
      where: {
        coupon: { id: coupon.id },
        user: { id: user.id },
        status: RedemptionStatus.REDEEMED,
      },
    });
    if (userRedemptions >= coupon.perUserLimit) {
      throw new BadRequestException(
        'You have already used this coupon the maximum number of times.',
      );
    }

    if (coupon.sourceType === CouponSourceType.BUSINESS && coupon.business) {
      if (coupon.business.status !== BusinessStatus.PUBLISHED) {
        throw new BadRequestException(
          `Business "${coupon.business.businessName}" is not currently active. Coupon cannot be used.`,
        );
      }
      if (!coupon.business.user || !coupon.business.user.isActive) {
        throw new BadRequestException(
          `The owner of business "${coupon.business.businessName}" is not currently active. Coupon cannot be used.`,
        );
      }

      try {
        await this.capabilityService.checkPermission(
          coupon.business.user.id,
          ActionType.CREATE_COUPON_TEMPLATE,
        );
      } catch (_e) {
        throw new BadRequestException(
          'The business providing this coupon does not have an active tier allowing coupon distribution.',
        );
      }
    }

    return coupon;
  }

  async redeem(
    code: string,
    user: User,
    _order: Order,
  ): Promise<RedemptionLog> {
    return this.dataSource.transaction(async (manager) => {
      const couponRepo = manager.getRepository(Coupon);
      const logRepo = manager.getRepository(RedemptionLog);

      const coupon = await couponRepo.findOne({
        where: { code },
        relations: ['campaign', 'business', 'business.user'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!coupon) throw new NotFoundException('Coupon not found');

      if (coupon.sourceType === CouponSourceType.BUSINESS && coupon.business) {
        if (coupon.business.status !== BusinessStatus.PUBLISHED) {
          throw new BadRequestException(
            `Business "${coupon.business.businessName}" is not currently active. Coupon cannot be redeemed.`,
          );
        }
        if (!coupon.business.user || !coupon.business.user.isActive) {
          throw new BadRequestException(
            `The owner of business "${coupon.business.businessName}" is not currently active. Coupon cannot be redeemed.`,
          );
        }
      }

      const now = new Date();
      if (
        coupon.status !== CouponStatus.ACTIVE &&
        coupon.status !== CouponStatus.SCHEDULED
      ) {
        throw new BadRequestException('Coupon is not active.');
      }
      if (coupon.expiresAt && now > coupon.expiresAt)
        throw new BadRequestException('Coupon has expired.');
      if (coupon.campaign) {
        if (coupon.campaign.status !== MarketingCampaignStatus.ACTIVE)
          throw new BadRequestException('Campaign is not active.');
        if (coupon.campaign.endDate && now > coupon.campaign.endDate)
          throw new BadRequestException('Campaign has ended.');
      }

      if (coupon.usageLimit > 0) {
        const totalRedemptions = await logRepo.count({
          where: {
            coupon: { id: coupon.id },
            status: RedemptionStatus.REDEEMED,
          },
        });
        if (totalRedemptions >= coupon.usageLimit)
          throw new BadRequestException('Coupon usage limit reached.');
      }

      const userRedemptions = await logRepo.count({
        where: {
          coupon: { id: coupon.id },
          user: { id: user.id },
          status: RedemptionStatus.REDEEMED,
        },
      });
      if (userRedemptions >= coupon.perUserLimit) {
        throw new BadRequestException(
          'You have already used this coupon the maximum number of times.',
        );
      }

      const log = logRepo.create({
        coupon,
        user,
        status: RedemptionStatus.REDEEMED,
      });
      return await logRepo.save(log);
    });
  }

  async findCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['campaign', 'business', 'business.user'],
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async redeemForOrder(
    payload: { code: string; amount?: number },
    order: Order,
    manager?: any,
  ): Promise<void> {
    const user = order.user;
    if (manager) {
      const couponRepo = manager.getRepository(Coupon);
      const logRepo = manager.getRepository(RedemptionLog);
      const coupon = await couponRepo.findOne({
        where: { code: payload.code },
      });
      if (!coupon) throw new NotFoundException('Coupon not found');

      const log = logRepo.create({
        coupon,
        user,
        status: RedemptionStatus.REDEEMED,
      });
      await logRepo.save(log);
    } else {
      await this.redeem(payload.code, user, order);
    }
  }

  async getSummaryStatistics(_ownerId: string): Promise<{
    totalSold: number;
    totalRedeemed: number;
    outstandingLiability: number;
  }> {
    return { totalSold: 0, totalRedeemed: 0, outstandingLiability: 0 };
  }

  async getOwnerStats(_userId: string): Promise<any> {
    return {
      totalSold: 0,
      totalRedeemed: 0,
      outstandingLiability: 0,
      activeCoupons: 0,
    };
  }

  async getSalesVsRedemptionsChartData(_userId: string): Promise<any> {
    return { data: [] };
  }

  async getTransactionHistoryForOwner(
    _userId: string,
    _startDate?: string,
    _endDate?: string,
  ): Promise<any[]> {
    return [];
  }

  async countForUser(userId: string): Promise<number> {
    return this.couponRepository.count({
      where: { business: { user: { id: userId } } },
      relations: ['business', 'business.user'],
    });
  }

  // ==== Consumer endpoints for saved coupons ====

  async saveCoupon(code: string, user: User): Promise<SavedCoupon> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const existing = await this.savedCouponRepository.findOne({
      where: { user: { id: user.id }, coupon: { id: coupon.id } },
    });

    if (existing) {
      throw new BadRequestException('Coupon is already saved');
    }

    const savedCoupon = this.savedCouponRepository.create({
      user,
      coupon,
    });

    return await this.savedCouponRepository.save(savedCoupon);
  }

  async removeSavedCoupon(code: string, user: User): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const savedCoupon = await this.savedCouponRepository.findOne({
      where: { user: { id: user.id }, coupon: { id: coupon.id } },
    });

    if (!savedCoupon) {
      throw new NotFoundException('Coupon was not saved');
    }

    await this.savedCouponRepository.remove(savedCoupon);
  }

  async getSavedCoupons(user: User): Promise<SavedCoupon[]> {
    return this.savedCouponRepository.find({
      where: { user: { id: user.id } },
      relations: ['coupon', 'coupon.campaign', 'coupon.business'],
      order: { savedAt: 'DESC' },
    });
  }

  async findProductById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: ['business', 'campaign'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    return coupon;
  }

  async findAllForUser(user: User, pagination: PaginationQueryDto): Promise<PageDto<Coupon>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.couponRepository.findAndCount({
      where: { business: { user: { id: user.id } } },
      skip,
      take: limit,
      relations: ['campaign', 'business', 'branding', 'branding.business'],
      order: { created_at: 'DESC' },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination as any,
    });

    return new PageDto(items, pageMetaDto);
  }
}
