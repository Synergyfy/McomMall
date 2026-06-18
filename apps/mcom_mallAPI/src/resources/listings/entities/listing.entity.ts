import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BusinessStatus, ListingType } from '../listing.enum';
import { IsOptional, IsUrl, Length } from 'class-validator';
import { Location } from './location.entity';
import { SocialLink } from './social_link.entity';
import { Category } from './category.entity';
import { Sector } from '../../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../../taxonomy/entities/taxonomy-subcategory.entity';
import { BusinessHour } from './business_hour.entity';
import { SpecialDay } from './special_days.entity';
import { ProductSellerProfile } from './product_seller_profiles.entity';
import { BusinessServiceProviderProfile } from './service_provider_profiles.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';
import { Promotion } from '../../promotion/entities/promotion.entity';
import { Service } from '../../services/entities/service.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { LocalMall } from '../../localmall/entities/localmall.entity';
import { Event } from '../../events/entities/event.entity';
import { Rotator } from '../../rotators/entities/rotator.entity';
import { Gamification } from '../../gamification/entities/gamification.entity';

@Entity('businesses')
export class Business extends AbstractBaseEntity {
  @ManyToOne(() => User, (user) => user.businesses)
  user: User;

  @Column({
    type: 'enum',
    enum: ListingType,
    array: true,
  })
  listingType: ListingType[];

  @Column()
  @Length(2, 100)
  businessName: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(2, 100)
  legalName?: string;

  @Column({ nullable: true })
  @IsOptional()
  companyRegistrationNumber?: string;

  @Column({ nullable: true })
  @IsOptional()
  vatNumber?: string;

  @Column()
  @Length(20, 180)
  shortDescription: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @Length(0, 2000)
  about?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Column()
  businessPhone: string; // Stored in +44 format

  @Column({ nullable: true })
  @IsOptional()
  businessEmail?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @Column({ nullable: true })
  @IsOptional()
  logoAltText?: string;

  @Column({ nullable: true })
  @IsOptional()
  bannerAltText?: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  @IsOptional()
  @IsUrl({}, { each: true })
  media?: string[];

  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.DRAFT,
  })
  status: BusinessStatus;

  @Column({ nullable: true })
  googlePlaceId?: string;

  @Column({ default: false })
  isGoogleVerified: boolean;

  @Column({ default: false })
  isClaimed: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column('float', { default: 0 })
  averageRating: number;

  @Column('int', { default: 0 })
  reviewCount: number;

  // --- Relationships ---

  @OneToOne(() => Location, (location) => location.business, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  location: Location;

  @OneToMany(() => SocialLink, (link) => link.business, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  socialLinks: SocialLink[];

  @ManyToOne(() => Sector, { nullable: true })
  @JoinColumn({ name: 'sectorId' })
  sector: Sector;

  @Column({ nullable: true })
  sectorId: string;

  @ManyToOne(() => TaxonomyCategory, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: TaxonomyCategory;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => TaxonomySubcategory, { nullable: true })
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: TaxonomySubcategory;

  @Column({ nullable: true })
  subCategoryId: string;

  @OneToMany(() => BusinessHour, (hour) => hour.business, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  businessHours: BusinessHour[];

  @OneToMany(() => SpecialDay, (day) => day.business, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  specialDays: SpecialDay[];

  @OneToOne(() => ProductSellerProfile, (profile) => profile.business, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
    onDelete: 'CASCADE',
  })
  productSellerProfile?: ProductSellerProfile;

  @OneToOne(() => BusinessServiceProviderProfile, (profile) => profile.business, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
    onDelete: 'CASCADE',
  })
  serviceProviderProfile?: BusinessServiceProviderProfile;

  @OneToMany(() => Product, (product) => product.business, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  products: Product[];

  @OneToMany(() => Campaign, (campaign) => campaign.business, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  campaigns: Campaign[];

  @OneToMany(() => Service, (service) => service.business, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  services: Service[];

  @ManyToMany(() => Promotion, (promotion) => promotion.businesses, {
    cascade: ['insert', 'update', 'remove'],
  })
  promotions: Promotion[];

  @OneToMany(() => Review, (review) => review.business)
  reviews: Review[];

  @ManyToMany(() => Offer, (offer) => offer.businesses, {
    cascade: ['insert', 'update', 'remove'],
  })
  offers: Offer[];

  @ManyToOne(() => LocalMall, (mall) => mall.businesses, { nullable: true, onDelete: 'SET NULL' })
  localMall?: LocalMall;

  @Column({ nullable: true })
  localMallId?: string;

  @OneToMany(() => Event, (event) => event.business)
  events: Event[];

  @OneToMany(() => Rotator, (rotator) => rotator.business)
  rotators: Rotator[];

  @OneToMany(() => Gamification, (gamification) => gamification.business)
  gamifications: Gamification[];
}
