import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { BannerType, MarketplaceBanner } from '../entities/marketplace-banner.entity';
import { SectionType, MarketplaceSection } from '../entities/marketplace-section.entity';
import { MarketplaceCategory } from '../entities/marketplace-category.entity';
import { VoucherProduct } from '../../voucher/entities/voucher-product.entity';
import { GiftCardTemplate } from '../../gift-card/entities/gift-card-template.entity';
import { CouponProduct } from '../../coupon/entities/coupon-product.entity';
import { Service } from '../../services/entities/service.entity';

// --- BANNER DTOs ---

export class CreateBannerDto {
  @ApiProperty({ description: 'URL of the image' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Title/Caption for the slide' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Where the banner links to' })
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiProperty({ enum: BannerType, default: BannerType.HERO_SLIDE })
  @IsEnum(BannerType)
  type: BannerType;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}

// --- SECTION DTOs ---

export class UpdateSectionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'JSON configuration (e.g., timer for flash sales)' })
  @IsOptional()
  config?: any;

  @ApiPropertyOptional({ description: 'List of Product IDs to feature' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];
}

// --- CATEGORY DTOs ---

export class CreateCategoryDto {
  @ApiProperty({ description: 'Display name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Lucide icon name (e.g., Home, Smartphone)' })
  @IsString()
  @IsOptional()
  iconName?: string;

  @ApiPropertyOptional({ description: 'Linked Taxonomy Category ID' })
  @IsUUID()
  @IsOptional()
  targetCategoryId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

// --- PUBLIC VIEW RESPONSE ---

export class MarketplacePublicViewDto {
  @ApiProperty({ type: [MarketplaceBanner] })
  heroSlides: MarketplaceBanner[];

  @ApiProperty({ type: [MarketplaceBanner] })
  sidebarBanners: MarketplaceBanner[];

  @ApiProperty({ type: [MarketplaceCategory] })
  categories: MarketplaceCategory[];

  @ApiProperty({
    description: 'Map of section types to their configurations',
    example: {
      flash_sale: { 
        title: 'Flash Sales', 
        isVisible: true, 
        config: { endTime: '2024-12-31' }, 
        products: [
          { id: 'uuid-1', title: 'Product A', price: 100, media: ['url-1'] }
        ] 
      },
      promo_carousel: { 
        title: 'Featured Products', 
        isVisible: true, 
        products: [
          { id: 'uuid-2', title: 'Product B', price: 50, media: ['url-2'] }
        ] 
      },
    },
  })
  sections: Record<string, MarketplaceSection>;

  @ApiProperty({ type: [VoucherProduct] })
  vouchers: VoucherProduct[];

  @ApiProperty({ type: [GiftCardTemplate] })
  giftCards: GiftCardTemplate[];

  @ApiProperty({ type: [CouponProduct] })
  coupons: CouponProduct[];

  @ApiProperty({ type: [Service] })
  services: Service[];
}