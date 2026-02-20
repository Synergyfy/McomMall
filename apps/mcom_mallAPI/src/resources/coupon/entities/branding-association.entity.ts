import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Business } from '../../listings/entities/listing.entity';
import { Coupon } from './coupon.entity';

@Entity('branding_associations')
export class BrandingAssociation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Coupon, (coupon) => coupon.branding)
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;
}
