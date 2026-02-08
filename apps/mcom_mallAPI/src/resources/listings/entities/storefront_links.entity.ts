import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsOptional, IsUrl, IsString } from 'class-validator';
import { ProductSellerProfile } from './product_seller_profiles.entity';

@Entity('storefront_links')
export class StorefrontLink extends AbstractBaseEntity {
  @Column({ type: 'varchar' })
  @IsString()
  platform: string;

  @Column({ nullable: true })
  @IsUrl()
  @IsOptional()
  url: string;

  @ManyToOne(() => ProductSellerProfile, (profile) => profile.storefrontLinks)
  productSellerProfile: ProductSellerProfile;
}
