import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly entityManager: EntityManager,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.product.business', 'items.product.business.user'],
    });

    if (!cart) {
      return { items: [], total: 0 };
    }

    const total = cart.items.reduce(
      (sum: number, item) => sum + item.product.price * item.quantity,
      0,
    );

    return { ...cart, total };
  }

  async addItemToCart(userId: string, addItemToCartDto: AddItemToCartDto) {
    const { productId, quantity, selectedVariants } = addItemToCartDto;

    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.entityManager.transaction(async (manager) => {
      let cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        const user = await manager.findOneBy(User, { id: userId });
        if (!user) {
          throw new NotFoundException('User not found');
        }
        cart = manager.create(Cart, { user, items: [] });
        await manager.save(cart);
      }

      const cartItem = cart.items.find((item) => item.product.id === productId);

      if (cartItem) {
        cartItem.quantity += quantity;
        await manager.save(cartItem);
      } else {
        const newCartItem = manager.create(CartItem, {
          cart,
          product,
          quantity,
          selectedVariants,
        });
        await manager.save(newCartItem);
      }
    });

    return this.getCart(userId);
  }

  async updateItemQuantity(
    userId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const { productId, quantity } = updateCartItemDto;

    await this.entityManager.transaction(async (manager) => {
      const cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const cartItem = cart.items.find((item) => item.product.id === productId);

      if (!cartItem) {
        throw new NotFoundException('Item not found in cart');
      }

      if (quantity === 0) {
        await manager.remove(cartItem);
      } else {
        cartItem.quantity = quantity;
        await manager.save(cartItem);
      }
    });

    return this.getCart(userId);
  }

  async removeItemFromCart(userId: string, productId: string) {
    return this.entityManager.transaction(async (manager) => {
      const cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const cartItem = cart.items.find((item) => item.product.id === productId);

      if (!cartItem) {
        throw new NotFoundException('Item not found in cart');
      }

      await manager.remove(cartItem);

      return this.getCart(userId);
    });
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    if (cart) {
      await this.cartItemRepository.remove(cart.items);
    }
  }
}
