import { Business } from '../entities/listing.entity';

export class ListingPublicDto extends Business {
  giftCard: boolean;
  voucher: boolean;
  promotion: boolean;
}
