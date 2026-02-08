import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Cart } from './cart.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('cart_items')
export class CartItem extends AbstractBaseEntity {
  @ManyToOne(() => Cart, (cart) => cart.items)
  cart: Cart;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'jsonb', nullable: true })
  selectedVariants: Record<string, string>;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
