import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { PromotionalOffer } from './promotional-offer.entity';

/**
 * A business importing an admin-created promotional offer into its storefront.
 * The business can add/remove the import but can never edit the offer itself.
 */
@Entity('business_promotional_offers')
@Index('UQ_business_promotional_offer', ['businessId', 'offerId'], {
  unique: true,
})
export class BusinessPromotionalOffer extends AbstractBaseEntity {
  @Column({ type: 'uuid' })
  businessId: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  importedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  removedAt?: Date | null;

  @Column({ type: 'uuid', nullable: true })
  importedByUserId?: string | null;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @ManyToOne(() => PromotionalOffer, (offer) => offer.businessImports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'offerId' })
  offer: PromotionalOffer;
}
