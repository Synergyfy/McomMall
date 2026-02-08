import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { SellingMode } from '../listing.enum';
import { IsBoolean, IsOptional } from 'class-validator';
import { Business } from './listing.entity';
import { StorefrontLink } from './storefront_links.entity';

@Entity('product_seller_profiles')
export class ProductSellerProfile extends AbstractBaseEntity {
  @Column({ type: 'enum', enum: SellingMode, array: true })
  sellingModes: SellingMode[];

  @Column('text', { nullable: true })
  @IsOptional()
  fulfilmentNotes?: string;

  @Column({ nullable: true })
  @IsOptional()
  returnsPolicy?: string; // Can be text or a URL

  @Column({ default: false })
  @IsBoolean()
  hasAgeRestrictedItems: boolean;

  @OneToOne(() => Business, (business) => business.productSellerProfile)
  @JoinColumn()
  business: Business;

  @OneToMany(() => StorefrontLink, (link) => link.productSellerProfile, {
    cascade: true,
  })
  storefrontLinks: StorefrontLink[];
}
