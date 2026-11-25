import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FlashSaleItem } from './entities/flash-sale-item.entity';
import { FlashSaleStatus } from './flash-sale.enum';
import { CreateFlashSaleItemDto } from './dto/create-flash-sale-item.dto';
import { UpdateFlashSaleItemDto } from './dto/update-flash-sale-item.dto';
import { Business } from '../listings/entities/listing.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { Product } from '../product/entities/product.entity';
import { UserRole } from '../../common/role.enum';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';

@Injectable()
export class FlashSalesService {
  constructor(
    @InjectRepository(FlashSaleItem)
    private readonly flashSaleItemRepository: Repository<FlashSaleItem>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * A flash sale is owned via its businessId, falling back to the owning
   * business of its productId. Callers must own that business (or be admin).
   */
  private async assertCanManage(
    owner: { businessId?: string | null; productId?: string | null },
    requester: { id: string; role?: string },
  ): Promise<void> {
    if (requester.role === UserRole.ADMIN) return;

    if (owner.businessId) {
      const business = await this.businessRepository.findOne({
        where: { id: owner.businessId },
        relations: ['user'],
      });
      if (!business) {
        throw new NotFoundException(
          `Business with ID ${owner.businessId} not found`,
        );
      }
      if (business.user?.id === requester.id) return;
    }

    if (owner.productId) {
      const product = await this.productRepository.findOne({
        where: { id: owner.productId },
        relations: ['business', 'business.user'],
      });
      if (product?.business?.user?.id === requester.id) return;
    }

    throw new ForbiddenException(
      'You do not have permission to manage this flash sale.',
    );
  }

  private resolveStatus(item: FlashSaleItem): FlashSaleStatus {
    if (item.status === FlashSaleStatus.ENDED) {
      return FlashSaleStatus.ENDED;
    }
    const now = new Date();
    if (item.endDate <= now) {
      return FlashSaleStatus.ENDED;
    }
    return item.status;
  }

  async findAllActive(): Promise<FlashSaleItem[]> {
    const now = new Date();
    const items = await this.flashSaleItemRepository
      .createQueryBuilder('fsi')
      .where('fsi.status = :active', { active: FlashSaleStatus.ACTIVE })
      .andWhere('fsi.endDate > :now', { now })
      .orderBy('fsi.endDate', 'ASC')
      .getMany();

    // A flash sale snapshot must not outlive the approval/delisting state of
    // the product it points at.
    const productIds = items
      .map((item) => item.productId)
      .filter((id): id is string => !!id);
    const allowedProductIds = productIds.length
      ? new Set(
          (
            await this.productRepository.find({
              where: {
                id: In(productIds),
                approvalStatus: ApprovalStatus.APPROVED,
                adminDisabled: false,
                productStatus: 'published',
                visibility: 'public',
                business: { status: BusinessStatus.PUBLISHED },
              },
            })
          ).map((product) => product.id),
        )
      : new Set<string>();

    const businessIds = items
      .map((item) => item.businessId)
      .filter((id): id is string => !!id);
    const allowedBusinessIds = businessIds.length
      ? new Set(
          (
            await this.businessRepository.find({
              where: { id: In(businessIds), status: BusinessStatus.PUBLISHED },
            })
          ).map((business) => business.id),
        )
      : new Set<string>();

    return items
      .filter(
        (item) =>
          (!item.productId || allowedProductIds.has(item.productId)) &&
          (!item.businessId || allowedBusinessIds.has(item.businessId)),
      )
      .map((item) => ({
        ...item,
        status: this.resolveStatus(item),
      }));
  }

  async findAll(): Promise<FlashSaleItem[]> {
    return this.flashSaleItemRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FlashSaleItem> {
    const item = await this.flashSaleItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Flash sale item with ID "${id}" not found`);
    }
    return { ...item, status: this.resolveStatus(item) };
  }

  async create(
    dto: CreateFlashSaleItemDto,
    requester: { id: string; role?: string },
  ): Promise<FlashSaleItem> {
    await this.assertCanManage(
      { businessId: dto.businessId, productId: dto.productId },
      requester,
    );

    if (dto.productId) {
      const product = await this.productRepository.findOneBy({
        id: dto.productId,
      });
      if (
        !product ||
        product.approvalStatus !== ApprovalStatus.APPROVED ||
        product.adminDisabled ||
        product.productStatus !== 'published' ||
        product.visibility !== 'public'
      ) {
        throw new BadRequestException(
          'Only an approved, published product can be promoted in a flash sale.',
        );
      }
    }

    const item = this.flashSaleItemRepository.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: new Date(dto.endDate),
      status: dto.status ?? FlashSaleStatus.ACTIVE,
    });

    if (item.startDate >= item.endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    return this.flashSaleItemRepository.save(item);
  }

  async update(
    id: string,
    dto: UpdateFlashSaleItemDto,
    requester: { id: string; role?: string },
  ): Promise<FlashSaleItem> {
    const item = await this.findOne(id);
    await this.assertCanManage(
      {
        businessId: dto.businessId ?? item.businessId,
        productId: dto.productId ?? item.productId,
      },
      requester,
    );
    const merged = this.flashSaleItemRepository.merge(item, dto);
    if (dto.endDate) {
      merged.endDate = new Date(dto.endDate);
    }
    if (dto.startDate) {
      merged.startDate = new Date(dto.startDate);
    }
    return this.flashSaleItemRepository.save(merged);
  }

  async remove(
    id: string,
    requester: { id: string; role?: string },
  ): Promise<void> {
    const item = await this.findOne(id);
    await this.assertCanManage(
      { businessId: item.businessId, productId: item.productId },
      requester,
    );
    await this.flashSaleItemRepository.remove(item);
  }
}
