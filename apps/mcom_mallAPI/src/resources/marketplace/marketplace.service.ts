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

@Injectable()
export class MarketplaceService {
  constructor(private readonly dataSource: DataSource) { }

  // --- PUBLIC AGGREGATION ---

  async getPublicView() {
    const banners = await this.dataSource.manager.find(MarketplaceBanner, {
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    const categories = await this.dataSource.manager.find(MarketplaceCategory, {
      where: { isVisible: true },
      order: { displayOrder: 'ASC' },
    });

    let sections = await this.dataSource.manager.find(MarketplaceSection, {
      where: { isVisible: true },
      relations: ['products', 'products.business'],
    });

    // Filter products within sections: Must be published, public, in stock (if managed), and belong to active business
    sections = sections.map((section) => {
      section.products = (section.products || []).filter((p) => {
        const isPublished = p.productStatus === 'published';
        const isPublic = p.visibility === 'public';
        const hasBaseStock = !p.enableStockManagement || p.stock > 0;
        const hasVariationStock =
          p.variations &&
          p.variations.some((v) => v.stock > 0 && v.available !== false);
        const inStock = hasBaseStock || hasVariationStock;
        const businessActive = p.business?.status === BusinessStatus.PUBLISHED;

        return isPublished && isPublic && inStock && businessActive;
      });
      return section;
    });

    let vouchers = await this.dataSource.manager.find(VoucherProduct, {
      where: { isEnabled: true },
      relations: ['user', 'user.businesses'],
      order: { createdAt: 'DESC' },
    });

    // Filter vouchers: Owner must have at least one published business
    vouchers = vouchers.filter((v) =>
      v.user?.businesses?.some((b) => b.status === BusinessStatus.PUBLISHED),
    );
    vouchers = vouchers.slice(0, 5);

    let giftCards = await this.dataSource.manager.find(GiftCardTemplate, {
      where: { isActive: true },
      relations: ['owner', 'owner.businesses'],
      order: { created_at: 'DESC' },
    });

    // Filter gift cards: Owner must have at least one published business
    giftCards = giftCards.filter((gc) =>
      gc.owner?.businesses?.some((b) => b.status === BusinessStatus.PUBLISHED),
    );
    giftCards = giftCards.slice(0, 5);

    let coupons = await this.dataSource.manager.find(Coupon, {
      where: {
        status: CouponStatus.ACTIVE,
        sourceType: CouponSourceType.PLATFORM,
      },
      relations: ['campaign', 'redemptionLogs'],
      order: { created_at: 'DESC' },
    });

    // Filter coupons: Must not have reached usage limit
    coupons = coupons.filter((c) => {
      if (c.usageLimit <= 0) return true;
      const redeemedCount = (c.redemptionLogs || []).filter(
        (log) => log.status === 'redeemed',
      ).length;
      return redeemedCount < c.usageLimit;
    });
    coupons = coupons.slice(0, 5);

    const services = await this.dataSource.manager.find(Service, {
      where: {
        isActive: true,
        status: 'published',
        business: { status: BusinessStatus.PUBLISHED },
      },
      relations: ['business'],
      order: { created_at: 'DESC' },
      take: 5,
    });

    let products = await this.dataSource.manager.find(Product, {
      where: {
        productStatus: 'published',
        visibility: 'public',
        business: { status: BusinessStatus.PUBLISHED },
      },
      relations: ['business'],
      order: { created_at: 'DESC' },
    });

    products = products
      .filter((p) => {
        const hasBaseStock = !p.enableStockManagement || p.stock > 0;
        const hasVariationStock =
          p.variations &&
          p.variations.some((v) => v.stock > 0 && v.available !== false);
        return hasBaseStock || hasVariationStock;
      })
      .slice(0, 5);

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
