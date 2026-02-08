import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export enum BannerType {
  HERO_SLIDE = 'hero_slide', // The main "Treasure Hunt" carousel
  SIDEBAR_BANNER = 'sidebar_banner', // The Black Friday banner
}

@Entity('marketplace_banners')
export class MarketplaceBanner extends AbstractBaseEntity {
  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  @Column()
  imageUrl: string;

  @ApiProperty({ example: 'Summer Sale', required: false })
  @Column({ nullable: true })
  title: string;

  @ApiProperty({ example: '/category/electronics', required: false })
  @Column({ nullable: true })
  linkUrl: string;

  @ApiProperty({ enum: BannerType, default: BannerType.HERO_SLIDE })
  @Column({
    type: 'enum',
    enum: BannerType,
    default: BannerType.HERO_SLIDE,
  })
  type: BannerType;

  @ApiProperty({ example: 1 })
  @Column({ default: 0 })
  displayOrder: number;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isActive: boolean;
}
