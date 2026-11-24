import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { PromotionalOffer } from './promotional-offer.entity';

/** Explicit allow-list used when an offer's availability is `selected`. */
@Entity('promotional_offer_businesses')
@Index('UQ_promotional_offer_business', ['offerId', 'businessId'], {
  unique: true,
})
export class PromotionalOfferBusiness extends AbstractBaseEntity {
  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'uuid' })
  businessId: string;

  @ManyToOne(() => PromotionalOffer, (offer) => offer.availableBusinesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'offerId' })
  offer: PromotionalOffer;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;
}
