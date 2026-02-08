import { Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Product } from '../../product/entities/product.entity';
import { Service } from '../../services/entities/service.entity';
import { Wishlist } from './wishlist.entity';

@Entity('wishlist_items')
export class WishlistItem extends AbstractBaseEntity {
  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items)
  wishlist: Wishlist;

  @ManyToOne(() => Product, { eager: true, nullable: true })
  product: Product;

  @ManyToOne(() => Service, { eager: true, nullable: true })
  service: Service;
}
