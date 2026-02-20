import { Injectable, NotFoundException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponProduct } from './entities/coupon-product.entity';
import { CouponProductSearchDto } from './dto/coupon-product-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { Business } from '../listings/entities/listing.entity';
import { CapabilityService, ActionType } from '../capability/capability.service';
import { CreateCouponProductDto } from './dto/create-coupon-product.dto';
import { UpdateCouponProductDto } from './dto/update-coupon-product.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CouponProductService {
  constructor(
    @InjectRepository(CouponProduct)
    private readonly couponProductRepository: Repository<CouponProduct>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
  ) {}

  async findCouponProductsByBusiness(businessId: string): Promise<CouponProduct[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID "${businessId}" not found.`);
    }
    if (!business.user) {
      throw new InternalServerErrorException(
        `Business with ID "${businessId}" has no associated owner.`,
      );
    }
    return this.couponProductRepository.find({
      where: {
        user: { id: business.user.id },
        isEnabled: true,
      },
    });
  }

  async create(createCouponProductDto: CreateCouponProductDto, user: User) {
    const currentCount = await this.couponProductRepository.count({
        where: { user: { id: user.id } }
    });
    await this.capabilityService.checkPermission(user.id, ActionType.CREATE_COUPON_TEMPLATE, { currentCount });

    const couponProduct = this.couponProductRepository.create({
      ...createCouponProductDto,
      user,
    });
    return this.couponProductRepository.save(couponProduct);
  }

  async findAll(user: User) {
    return this.couponProductRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string, user: User) {
    return this.couponProductRepository.findOne({ where: { id, user: { id: user.id } } });
  }

  async update(id: string, updateCouponProductDto: UpdateCouponProductDto, user: User) {
    const couponProduct = await this.findOne(id, user);
    if (!couponProduct) {
      return null;
    }
    Object.assign(couponProduct, updateCouponProductDto);
    return this.couponProductRepository.save(couponProduct);
  }

  async remove(id: string, user: User) {
    const couponProduct = await this.findOne(id, user);
    if (!couponProduct) {
      return null;
    }
    return this.couponProductRepository.softRemove(couponProduct);
  }

  async countForUser(userId: string): Promise<number> {
    return this.couponProductRepository.count({ where: { user: { id: userId } } });
  }

  async findAllPublic(searchDto: CouponProductSearchDto): Promise<PageDto<CouponProduct>> {
    const { page, limit, search, minAmount, maxAmount, businessId, businessName } = searchDto;

    const queryBuilder = this.couponProductRepository.createQueryBuilder('couponProduct');

    queryBuilder
      .leftJoinAndSelect('couponProduct.user', 'user')
      .leftJoin('user.businesses', 'business')
      .where('couponProduct.isEnabled = :isEnabled', { isEnabled: true });

    if (search) {
      queryBuilder.andWhere(
        '(couponProduct.name ILIKE :search OR couponProduct.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (minAmount !== undefined) {
      queryBuilder.andWhere('couponProduct.minCustomAmount >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('couponProduct.maxCustomAmount <= :maxAmount', { maxAmount });
    }

    if (businessId) {
      queryBuilder.andWhere('business.id = :businessId', { businessId });
    }

    if (businessName) {
      queryBuilder.andWhere('business.businessName ILIKE :businessName', {
        businessName: `%${businessName}%`,
      });
    }

    queryBuilder
      .orderBy('couponProduct.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      totalItems,
      itemCount: items.length,
      pageOptionsDto: searchDto,
    });

    return new PageDto(items, pageMetaDto);
  }
}