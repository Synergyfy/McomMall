import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import {
  MarketplaceBanner,
  BannerType,
} from './entities/marketplace-banner.entity';
import { MarketplaceCategory } from './entities/marketplace-category.entity';
import {
  MarketplaceSection,
  SectionType,
} from './entities/marketplace-section.entity';
import {
  CreateBannerDto,
  UpdateBannerDto,
  CreateMarketplaceCategoryDto,
  UpdateMarketplaceCategoryDto,
  UpdateSectionDto,
} from './dto/dtos';
import { Product } from '../product/entities/product.entity';
import { VoucherProduct } from '../voucher/entities/voucher-product.entity';
import { GiftCardTemplate } from '../gift-card/entities/gift-card-template.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { CouponStatus, CouponSourceType } from '../coupon/coupon.enum';
import { Service } from '../services/entities/service.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';
import { LocationFilterDto } from '../geography/dto/location-filter.dto';
import {
  applyBusinessLocationFilter,
  applyBusinessNearOrder,
  applySellerLocationFilter,
  applySellerNearOrder,
  hasLocationFilter,
} from '../geography/location-filter.util';

@Injectable()
export class MarketplaceService {
  /**
   * Landing-page aggregates are identical for every shopper in the same
   * location. A 60-second in-process cache turns a high-traffic marketplace
   * page into one DB round-trip per location per minute instead of five
   * queries per visit.
   */
  private readonly publicViewCache = new Map<
    string,
    { expiresAt: number; value: unknown }
  >();

  constructor(private readonly dataSource: DataSource) {}

  // --- PUBLIC AGGREGATION ---

  async getPublicView(location?: LocationFilterDto) {
    const key = JSON.stringify({
      type: location?.locationType || null,
      id: location?.locationId || null,
      name: location?.locationName || null,
      mall: location?.nearLocalMallId || null,
      highStreet: location?.nearHighStreetId || null,
      borough: location?.nearBoroughId || null,
    });

    const cached = this.publicViewCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = await this.buildPublicView(location);
    if (this.publicViewCache.size > 200) this.publicViewCache.clear();
    this.publicViewCache.set(key, {
      expiresAt: Date.now() + 60 * 1000,
      value,
    });
    return value;
  }

  private async buildPublicView(location?: LocationFilterDto) {
    const [banners, categories] = await Promise.all([
      this.dataSource.manager.find(MarketplaceBanner, {
        where: { isActive: true },
        order: { displayOrder: 'ASC' },
      }),
      this.dataSource.manager.find(MarketplaceCategory, {
        where: { isVisible: true },
        order: { displayOrder: 'ASC' },
      }),
    ]);

    let sections = await this.dataSource.manager.find(MarketplaceSection, {
      where: { isVisible: true },
      relations: ['products', 'products.business', 'products.business.location'],
    });

    // Filter products within sections: Must be published, public, in stock (if
    // managed), belong to an active business and match the location filter.
    sections = sections.map((section) => {
      section.products = (section.products || []).filter((p) => {
        const isApproved = p.approvalStatus === ApprovalStatus.APPROVED;
        const isPublished = p.productStatus === 'published';
        const isPublic = p.visibility === 'public';
        const hasBaseStock = !p.enableStockManagement || p.stock > 0;
        const hasVariationStock =
          p.variations &&
          p.variations.some((v) => v.stock > 0 && v.available !== false);
        const inStock = hasBaseStock || hasVariationStock;
        const businessActive = p.business?.status === BusinessStatus.PUBLISHED;

        return (
          isApproved &&
          !p.adminDisabled &&
          isPublished &&
          isPublic &&
          inStock &&
          businessActive &&
          this.businessMatchesLocation(p.business, location)
        );
      });
      return section;
    });

    const [vouchers, giftCards, coupons, services, products] =
      await Promise.all([
        this.findPublicVouchers(location, 5),
        this.findPublicGiftCards(location, 5),
        this.findPublicPlatformCoupons(5),
        this.findPublicServices(location, 5),
        this.findPublicProducts(location, 5),
      ]);

    return {
      heroSlides: banners.filter((b) => b.type === BannerType.HERO_SLIDE),
      sidebarBanners: banners.filter(
        (b) => b.type === BannerType.SIDEBAR_BANNER,
      ),
      categories,
      sections: sections.reduce((acc, section) => {
        acc[section.type] = section;
        return acc;
      }, {}),
      vouchers,
      giftCards,
      coupons,
      services,
      products,
    };
  }

  private businessMatchesLocation(
    business: Record<string, any> | null | undefined,
    location?: LocationFilterDto,
  ): boolean {
    if (!business || !hasLocationFilter(location)) return true;

    const level = location?.locationType;
    if (!level) return true;

    if (level === 'area') {
      const areaName = (
        location?.locationName ||
        location?.locationId ||
        ''
      ).toLowerCase();
      if (!areaName) return true;
      return [
        business.geoCityName,
        business.geoBoroughName,
        business.geoHighStreetName,
        business.geoLocalMallName,
        business.location?.city,
        business.location?.resolvedArea,
      ].some(
        (value) => String(value || '').toLowerCase() === areaName,
      );
    }

    if (level === 'postcode') {
      const prefix = (
        location?.locationId ||
        location?.locationName ||
        ''
      )
        .toUpperCase()
        .replace(/\s+/g, '');
      if (!prefix) return true;
      return String(business.location?.postcode || '')
        .toUpperCase()
        .replace(/\s+/g, '')
        .startsWith(prefix);
    }

    const columns: Record<string, { id: string; name: string }> = {
      city: { id: 'geoCityId', name: 'geoCityName' },
      borough: { id: 'geoBoroughId', name: 'geoBoroughName' },
      'high-street': { id: 'geoHighStreetId', name: 'geoHighStreetName' },
      'local-mall': { id: 'geoLocalMallId', name: 'geoLocalMallName' },
    };
    const column = columns[level];
    if (!column) return true;

    if (location?.locationId && business[column.id] === location.locationId) {
      return true;
    }
    if (
      location?.locationName &&
      String(business[column.name] || '').toLowerCase() ===
        location.locationName.toLowerCase()
    ) {
      return true;
    }
    return false;
  }

  private async findPublicVouchers(
    location: LocationFilterDto | undefined,
    limit: number,
  ) {
    const query = this.dataSource.manager
      .createQueryBuilder(VoucherProduct, 'voucherProduct')
      .leftJoinAndSelect('voucherProduct.user', 'user')
      .where('voucherProduct.isEnabled = :isEnabled', { isEnabled: true })
      .andWhere('voucherProduct.approvalStatus = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      })
      .andWhere('voucherProduct.adminDisabled = false')
      .andWhere(
        `EXISTS (
          SELECT 1 FROM "businesses" voucher_owner
          WHERE voucher_owner."userId" = "voucherProduct"."userId"
            AND voucher_owner."status" = :voucherOwnerStatus
            AND voucher_owner."deleted_at" IS NULL
        )`,
        { voucherOwnerStatus: BusinessStatus.PUBLISHED },
      );

    applySellerLocationFilter(
      query,
      'voucherProduct',
      'userId',
      location,
    );
    applySellerNearOrder(query, 'voucherProduct', 'userId', location);

    return query
      .orderBy('voucherProduct.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  private async findPublicGiftCards(
    location: LocationFilterDto | undefined,
    limit: number,
  ) {
    const query = this.dataSource.manager
      .createQueryBuilder(GiftCardTemplate, 'template')
      .leftJoinAndSelect('template.owner', 'owner')
      .where('template.isActive = :isActive', { isActive: true })
      .andWhere('template.approvalStatus = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      })
      .andWhere('template.adminDisabled = false')
      .andWhere(
        `EXISTS (
          SELECT 1 FROM "businesses" gift_owner
          WHERE gift_owner."userId" = "template"."ownerId"
            AND gift_owner."status" = :giftOwnerStatus
            AND gift_owner."deleted_at" IS NULL
        )`,
        { giftOwnerStatus: BusinessStatus.PUBLISHED },
      );

    applySellerLocationFilter(query, 'template', 'ownerId', location);
    applySellerNearOrder(query, 'template', 'ownerId', location);

    return query
      .orderBy('template.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  private async findPublicPlatformCoupons(limit: number) {
    const coupons = await this.dataSource.manager.find(Coupon, {
      where: {
        status: CouponStatus.ACTIVE,
        sourceType: CouponSourceType.PLATFORM,
        approvalStatus: ApprovalStatus.APPROVED,
        adminDisabled: false,
      },
      relations: ['campaign', 'redemptionLogs'],
      order: { created_at: 'DESC' },
      // Only the newest handful are shown; cap the read so a large coupon
      // catalogue cannot turn the landing page into a full-table scan.
      take: Math.max(limit * 10, 50),
    });

    // Platform coupons are platform-wide, so they are not narrowed by
    // location. Merchant coupons are served by the coupon-products endpoint
    // and are location-filtered there.
    return coupons
      .filter((coupon) => {
        if (coupon.usageLimit <= 0) return true;
        const redeemedCount = (coupon.redemptionLogs || []).filter(
          (log) => log.status === 'redeemed',
        ).length;
        return redeemedCount < coupon.usageLimit;
      })
      .slice(0, limit);
  }

  private async findPublicServices(
    location: LocationFilterDto | undefined,
    limit: number,
  ) {
    const query = this.dataSource.manager
      .createQueryBuilder(Service, 'service')
      .leftJoinAndSelect('service.business', 'business')
      .leftJoin('business.location', 'businessLocation')
      .where('service.isActive = :isActive', { isActive: true })
      .andWhere('service.status = :status', { status: 'published' })
      .andWhere('service.approvalStatus = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      })
      .andWhere('service.adminDisabled = false')
      .andWhere('business.status = :businessStatus', {
        businessStatus: BusinessStatus.PUBLISHED,
      });

    applyBusinessLocationFilter(
      query,
      'business',
      location,
      'loc',
      'businessLocation',
    );
    applyBusinessNearOrder(query, 'business', location);

    return query
      .orderBy('service.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  private async findPublicProducts(
    location: LocationFilterDto | undefined,
    limit: number,
  ) {
    const query = this.dataSource.manager
      .createQueryBuilder(Product, 'product')
      .leftJoinAndSelect('product.business', 'business')
      .leftJoin('business.location', 'businessLocation')
      .where('product.approvalStatus = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      })
      .andWhere('product.productStatus = :status', { status: 'published' })
      .andWhere('product.visibility = :visibility', { visibility: 'public' })
      .andWhere('product.adminDisabled = false')
      .andWhere('business.status = :businessStatus', {
        businessStatus: BusinessStatus.PUBLISHED,
      })
      .andWhere(
        '(product.enableStockManagement = false OR product.stock > 0 OR (product.variations IS NOT NULL AND jsonb_path_exists(product.variations, :jsonPath)))',
        { jsonPath: '$[*] ? (@.stock > 0)' },
      );

    applyBusinessLocationFilter(
      query,
      'business',
      location,
      'loc',
      'businessLocation',
    );
    applyBusinessNearOrder(query, 'business', location);

    return query
      .orderBy('product.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  // --- BANNERS ---

  async createBanner(dto: CreateBannerDto) {
    const banner = new MarketplaceBanner();
    Object.assign(banner, dto);
    return await this.dataSource.manager.save(banner);
  }

  async findAllBanners() {
    return await this.dataSource.manager.find(MarketplaceBanner, {
      order: { type: 'ASC', displayOrder: 'ASC' },
    });
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const banner = await this.dataSource.manager.findOne(MarketplaceBanner, {
      where: { id },
    });
    if (!banner) throw new NotFoundException('Banner not found');
    Object.assign(banner, dto);
    return await this.dataSource.manager.save(banner);
  }

  async deleteBanner(id: string) {
    return await this.dataSource.manager.delete(MarketplaceBanner, id);
  }

  // --- CATEGORIES ---

  async createCategory(dto: CreateMarketplaceCategoryDto) {
    const category = new MarketplaceCategory();
    Object.assign(category, dto);
    return await this.dataSource.manager.save(category);
  }

  async findAllCategories() {
    return await this.dataSource.manager.find(MarketplaceCategory, {
      order: { displayOrder: 'ASC' },
    });
  }

  async updateCategory(id: string, dto: UpdateMarketplaceCategoryDto) {
    const category = await this.dataSource.manager.findOne(
      MarketplaceCategory,
      { where: { id } },
    );
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, dto);
    return await this.dataSource.manager.save(category);
  }

  async deleteCategory(id: string) {
    return await this.dataSource.manager.delete(MarketplaceCategory, id);
  }

  // --- SECTIONS ---

  async updateSection(type: SectionType, dto: UpdateSectionDto) {
    let section = await this.dataSource.manager.findOne(MarketplaceSection, {
      where: { type },
      relations: ['products'],
    });

    if (!section) {
      // Create if it doesn't exist (Seed on the fly)
      section = new MarketplaceSection();
      section.type = type;
      section.title =
        type === SectionType.FLASH_SALE ? 'Flash Sales' : 'Promotional';
    }

    if (dto.title !== undefined) section.title = dto.title;
    if (dto.isVisible !== undefined) section.isVisible = dto.isVisible;
    if (dto.config !== undefined) section.config = dto.config;

    if (dto.productIds) {
      const products = await this.dataSource.manager.find(Product, {
        where: { id: In(dto.productIds) },
      });
      section.products = products;
    }

    return await this.dataSource.manager.save(section);
  }

  async getAllSections() {
    return await this.dataSource.manager.find(MarketplaceSection, {
      relations: ['products'],
    });
  }
}
