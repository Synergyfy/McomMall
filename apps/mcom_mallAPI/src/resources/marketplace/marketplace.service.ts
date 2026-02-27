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
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateSectionDto,
} from './dto/dtos';
import { Product } from '../product/entities/product.entity';
import { VoucherProduct } from '../voucher/entities/voucher-product.entity';
import { GiftCardTemplate } from '../gift-card/entities/gift-card-template.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { CouponStatus, CouponSourceType } from '../coupon/coupon.enum';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class MarketplaceService {
  constructor(private readonly dataSource: DataSource) {}

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

    const sections = await this.dataSource.manager.find(MarketplaceSection, {
      where: { isVisible: true },
      relations: ['products'],
    });

    const vouchers = await this.dataSource.manager.find(VoucherProduct, {
      where: { isEnabled: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const giftCards = await this.dataSource.manager.find(GiftCardTemplate, {
      where: { isActive: true },
      order: { created_at: 'DESC' },
      take: 5,
    });

    const coupons = await this.dataSource.manager.find(Coupon, {
      where: {
        status: CouponStatus.ACTIVE,
        sourceType: CouponSourceType.PLATFORM,
      },
      relations: ['campaign'],
      order: { created_at: 'DESC' },
      take: 5,
    });

    const services = await this.dataSource.manager.find(Service, {
      where: { isActive: true, status: 'published' },
      order: { created_at: 'DESC' },
      take: 5,
    });

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

  async createCategory(dto: CreateCategoryDto) {
    const category = new MarketplaceCategory();
    Object.assign(category, dto);
    return await this.dataSource.manager.save(category);
  }

  async findAllCategories() {
    return await this.dataSource.manager.find(MarketplaceCategory, {
      order: { displayOrder: 'ASC' },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
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
