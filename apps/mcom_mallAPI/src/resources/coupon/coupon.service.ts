import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, MoreThan } from 'typeorm';

import { Coupon } from './entities/coupon.entity';
import { CouponStatus, CouponSourceType, DiscountType } from './coupon.enum';
import { RedemptionLog, RedemptionStatus } from './entities/redemption-log.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { MarketingCampaign } from '../campaign/entities/marketing-campaign.entity';
import { Business } from '../listings/entities/listing.entity';
import { BrandingAssociation } from './entities/branding-association.entity';
import { User } from '../users/entities/user.entity';
import { MarketingCampaignStatus, MarketingCampaignType } from '../campaign/marketing-campaign.enum';
import { Order } from '../order/entities/order.entity';
import { CapabilityService, ActionType } from '../capability/capability.service';
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';

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
      startDate,
      expiresAt,
      campaignId,
      businessId,
      brandingBusinessId,
    } = dto;

    // Validate Business and Capability
    let business: Business | null = null;
    if (businessId) {
      business = await this.businessRepository.findOne({ where: { id: businessId }, relations: ['user'] });
      if (!business) throw new NotFoundException('Business not found');

      if (sourceType === CouponSourceType.BUSINESS) {
        // Strict Capability Check at Creation
        await this.capabilityService.checkPermission(business.user.id, ActionType.CREATE_COUPON_TEMPLATE);
      }
    }

    // Validate Campaign
    let campaign: MarketingCampaign | null = null;
    if (campaignId) {
      campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
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

    // Branding
    if (brandingBusinessId) {
      const brandingBusiness = await this.businessRepository.findOne({ where: { id: brandingBusinessId } });
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

  async validateCoupon(
    code: string,
    user: User,
    existingCouponCode?: string, // To check stacking
  ): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['campaign', 'business', 'business.user', 'branding', 'branding.business'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // 1. Stacking Check
    if (existingCouponCode && existingCouponCode !== code) {
      throw new BadRequestException('Stacking coupons is not allowed.');
    }

    // 2. Status Check
    if (coupon.status === CouponStatus.DISABLED || coupon.status === CouponStatus.ARCHIVED || coupon.status === CouponStatus.EXPIRED) {
      throw new BadRequestException('Coupon is not active.');
    }
    if (coupon.status === CouponStatus.DRAFT) {
        throw new BadRequestException('Coupon is not yet active.');
    }

    // 3. Expiration Check
    const now = new Date();
    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new BadRequestException('Coupon has expired.');
    }
    if (coupon.campaign) {
      if (coupon.campaign.endDate && now > coupon.campaign.endDate) {
        throw new BadRequestException('Campaign has ended.');
      }
      if (coupon.campaign.startDate && now < coupon.campaign.startDate) {
        throw new BadRequestException('Campaign has not started yet.');
      }
      if (coupon.campaign.status !== MarketingCampaignStatus.ACTIVE) {
        throw new BadRequestException('Campaign is not active.');
      }

      // 3.1 Hyperlocal Check (Postal Codes)
      if (coupon.campaign.type === MarketingCampaignType.HYPERLOCAL && coupon.campaign.targetPostalCodes?.length > 0) {
          const userAddress = await this.addressRepository.findOne({
              where: { user: { id: user.id }, isMain: true }
          });
          if (!userAddress || !userAddress.postalCode) {
              throw new BadRequestException('A valid shipping address with postal code is required for this hyperlocal offer.');
          }

          const normalizedUserCode = userAddress.postalCode.toUpperCase().replace(/\s/g, '');
          const isMatch = coupon.campaign.targetPostalCodes.some(target => {
              const normalizedTarget = target.toUpperCase().replace(/\s/g, '');
              return normalizedUserCode.startsWith(normalizedTarget);
          });

          if (!isMatch) {
              throw new BadRequestException('This coupon is not available in your area.');
          }
      }
    }

    // 4. Usage Limits
    if (coupon.usageLimit > 0) {
      const totalRedemptions = await this.redemptionLogRepository.count({
        where: { coupon: { id: coupon.id }, status: RedemptionStatus.REDEEMED },
      });
      if (totalRedemptions >= coupon.usageLimit) {
        throw new BadRequestException('Coupon usage limit reached.');
      }
    }

    // 5. Per User Limit
    const userRedemptions = await this.redemptionLogRepository.count({
      where: {
        coupon: { id: coupon.id },
        user: { id: user.id },
        status: RedemptionStatus.REDEEMED,
      },
    });
    if (userRedemptions >= coupon.perUserLimit) {
      throw new BadRequestException('You have already used this coupon the maximum number of times.');
    }

    // 6. Business Tier Check (If business coupon)
    if (coupon.sourceType === CouponSourceType.BUSINESS && coupon.business) {
        try {
            await this.capabilityService.checkPermission(coupon.business.user.id, ActionType.CREATE_COUPON_TEMPLATE);
        } catch (e) {
            throw new BadRequestException('The business providing this coupon does not have an active tier allowing coupon distribution.');
        }
    }

    return coupon;
  }

    async redeem(code: string, user: User, order: Order): Promise<RedemptionLog> {

      return this.dataSource.transaction(async (manager) => {

          const couponRepo = manager.getRepository(Coupon);

          const logRepo = manager.getRepository(RedemptionLog);

  

          // Fetch with lock to prevent race conditions on usage limits

          const coupon = await couponRepo.findOne({

              where: { code },

              relations: ['campaign', 'business', 'business.user'],

              lock: { mode: 'pessimistic_write' }

          });

  

          if (!coupon) throw new NotFoundException('Coupon not found');

  

          // 1. Transactional Validation

          const now = new Date();

          

          // Status & Expiry

          if (coupon.status !== CouponStatus.ACTIVE && coupon.status !== CouponStatus.SCHEDULED) {

              throw new BadRequestException('Coupon is not active.');

          }

          if (coupon.expiresAt && now > coupon.expiresAt) {

              throw new BadRequestException('Coupon has expired.');

          }

          

          // Campaign check

          if (coupon.campaign) {

              if (coupon.campaign.status !== MarketingCampaignStatus.ACTIVE) throw new BadRequestException('Campaign is not active.');

              if (coupon.campaign.endDate && now > coupon.campaign.endDate) throw new BadRequestException('Campaign has ended.');

          }

  

          // Usage Limits

          if (coupon.usageLimit > 0) {

              const totalRedemptions = await logRepo.count({

                  where: { coupon: { id: coupon.id }, status: RedemptionStatus.REDEEMED },

              });

              if (totalRedemptions >= coupon.usageLimit) {

                  throw new BadRequestException('Coupon usage limit reached.');

              }

          }

  

          // Per User Limit

          const userRedemptions = await logRepo.count({

              where: {

                  coupon: { id: coupon.id },

                  user: { id: user.id },

                  status: RedemptionStatus.REDEEMED,

              },

          });

          if (userRedemptions >= coupon.perUserLimit) {

              throw new BadRequestException('You have already used this coupon the maximum number of times.');

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

            

              

            

                async redeemForOrder(payload: { code: string; amount?: number }, order: Order, manager?: any): Promise<void> {

            

                  // Legacy support for OrderService

            

                  const user = order.user;

            

                  if (manager) {

            

                      // If manager is provided, we should use it

            

                      // Our 'redeem' method creates its own transaction, but here we might be inside one.

            

                      // We will implement a 'redeemWithManager' helper or logic.

            

                      const couponRepo = manager.getRepository(Coupon);

            

                      const logRepo = manager.getRepository(RedemptionLog);

            

                      const coupon = await couponRepo.findOne({ where: { code: payload.code } });

            

                      if (!coupon) throw new NotFoundException('Coupon not found');

            

                      

            

                      const log = logRepo.create({

            

                          coupon,

            

                          user,

            

                          status: RedemptionStatus.REDEEMED

            

                      });

            

                      await logRepo.save(log);

            

                  } else {

            

                      await this.redeem(payload.code, user, order);

            

                  }

            

                }

            

              

            

                  // Compatibility placeholder for WalletService

            

              

            

                  async getSummaryStatistics(ownerId: string): Promise<{ totalSold: number; totalRedeemed: number; outstandingLiability: number }> {

            

              

            

                      return {

            

              

            

                          totalSold: 0,

            

              

            

                          totalRedeemed: 0,

            

              

            

                          outstandingLiability: 0

            

              

            

                      };

            

              

            

                  }

            

              

            

                

            

              

            

                  async getOwnerStats(userId: string): Promise<any> {

            

              

            

                    return {

            

              

            

                        totalSold: 0,

            

              

            

                        totalRedeemed: 0,

            

              

            

                        outstandingLiability: 0,

            

              

            

                        activeCoupons: 0,

            

              

            

                    };

            

              

            

                  }

            

              

            

                

            

              

            

                  async getSalesVsRedemptionsChartData(userId: string): Promise<any> {

            

              

            

                    return { data: [] };

            

              

            

                  }

            

              

            

                

            

              

            

                  async getTransactionHistoryForOwner(userId: string, startDate?: string, endDate?: string): Promise<any[]> {

            

              

            

                    return [];

            

              

            

                  }

            

              

            

                

            

              

            

                  async createSystemCoupon(payload: any): Promise<any> {

            

              

            

                      // Bridging to new 'create' or just placeholder

            

              

            

                      return { message: 'System coupon creation is deprecated. Use the new CreateCoupon API.' };

            

              

            

                  }

            

              

            

                

            

              

            

                  async countForUser(userId: string): Promise<number> {

            

              

            

                

            

            return this.couponRepository.count({

              where: {

                business: {

                  user: { id: userId },

                },

              },

              relations: ['business', 'business.user'], // Ensure relation is loaded for query (though TypeORM count usually handles nested where)

            });

          }

        }

        