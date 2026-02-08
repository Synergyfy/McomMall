import { IsUrl } from 'class-validator';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Business } from './listing.entity';

@Entity('social_links')
export class SocialLink extends AbstractBaseEntity {
  @Column()
  platform: string;

  @Column()
  @IsUrl()
  url: string;

  @ManyToOne(() => Business, (business) => business.socialLinks)
  business: Business;
}
