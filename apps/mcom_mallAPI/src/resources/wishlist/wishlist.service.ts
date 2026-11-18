import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { ServicesService } from '../services/services.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { User } from '../users/entities/user.entity';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,
    private readonly productService: ProductService,
    private readonly servicesService: ServicesService,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, userId: string) {
    const { productId } = createWishlistDto;

    // Try to find as product
    const product = await this.productService.findOne(productId);
    let service = null;

    if (!product) {
      // Try to find as service
      service = await this.servicesService.findOne(productId).catch(() => null);
    }

    if (!product && !service) {
      throw new NotFoundException('Product or Service not found');
    }

    if (
      product &&
      (product.approvalStatus !== ApprovalStatus.APPROVED ||
        product.adminDisabled)
    ) {
      throw new NotFoundException('Product or Service not found');
    }
    if (
      service &&
      (service.approvalStatus !== ApprovalStatus.APPROVED ||
        service.adminDisabled)
    ) {
      throw new NotFoundException('Product or Service not found');
    }

    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.service'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        user: { id: userId } as User,
      });
      await this.wishlistRepository.save(wishlist);
      wishlist.items = [];
    }

    const existingItem = wishlist.items.find(
      (item) =>
        item.product?.id === productId || item.service?.id === productId,
    );
    if (existingItem) {
      return wishlist;
    }

    const wishlistItem = this.wishlistItemRepository.create({
      wishlist,
      product: product || null,
      service: service || null,
    });
    await this.wishlistItemRepository.save(wishlistItem);

    wishlist.items.push(wishlistItem);
    return wishlist;
  }

  async findAll(userId: string) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.service'],
    });

    if (!wishlist) {
      return wishlist;
    }

    // Never expose draft, private or paused listings through the wishlist.
    wishlist.items = (wishlist.items || []).filter((item) => {
      if (item.product) {
        return (
          item.product.approvalStatus === ApprovalStatus.APPROVED &&
          item.product.productStatus === 'published' &&
          item.product.visibility === 'public' &&
          !item.product.adminDisabled
        );
      }
      if (item.service) {
        return (
          item.service.approvalStatus === ApprovalStatus.APPROVED &&
          item.service.status === 'published' &&
          item.service.isActive &&
          !item.service.adminDisabled
        );
      }
      return false;
    });

    return wishlist;
  }

  async remove(productId: string, userId: string) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.service'],
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const wishlistItem = wishlist.items.find(
      (item) =>
        item.product?.id === productId || item.service?.id === productId,
    );

    if (!wishlistItem) {
      throw new NotFoundException('Product or Service not found in wishlist');
    }

    await this.wishlistItemRepository.remove(wishlistItem);

    wishlist.items = wishlist.items.filter(
      (item) =>
        item.product?.id !== productId && item.service?.id !== productId,
    );

    return wishlist;
  }
}
