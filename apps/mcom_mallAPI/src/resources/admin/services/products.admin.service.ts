import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/resources/product/entities/product.entity';
import { Repository } from 'typeorm';
import {
  ProductQueryDto,
  PaginatedProductsDto,
  ProductStatsDto,
  AdminProductDto,
} from '../dto/catalog.dto';
import { ApprovalStatus } from 'src/common/moderation/catalog-approval';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getStats(): Promise<ProductStatsDto> {
    const [total, active, outOfStock, pending, rejected, delisted] =
      await Promise.all([
        this.productsRepository.count(),
        this.productsRepository.count({
          where: {
            productStatus: 'published',
            approvalStatus: ApprovalStatus.APPROVED,
            adminDisabled: false,
          },
        }),
        this.productsRepository.count({ where: { stock: 0 } }),
        this.productsRepository.count({
          where: { approvalStatus: ApprovalStatus.PENDING },
        }),
        this.productsRepository.count({
          where: { approvalStatus: ApprovalStatus.REJECTED },
        }),
        this.productsRepository.count({ where: { adminDisabled: true } }),
      ]);

    return { total, active, outOfStock, pending, rejected, delisted };
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedProductsDto> {
    const { search, status, category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.business', 'business')
      .take(limit)
      .skip(skip)
      .orderBy('product.created_at', 'DESC');

    if (search) {
      qb.andWhere(
        '(product.title ILIKE :search OR business.businessName ILIKE :search OR product.id::text ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status !== 'all') {
      let pStatus = status;
      if (status === 'active') pStatus = 'published';

      if (status === 'out_of_stock') {
        qb.andWhere('product.stock = 0');
      } else if (status === 'inactive') {
        qb.andWhere(
          '(product.adminDisabled = true OR product.approvalStatus != :approvedStatus OR product.productStatus = :draftStatus)',
          {
            approvedStatus: ApprovalStatus.APPROVED,
            draftStatus: 'draft',
          },
        );
      } else if (status === 'pending') {
        qb.andWhere('product.approvalStatus = :approvalStatus', {
          approvalStatus: ApprovalStatus.PENDING,
        });
      } else if (status === 'rejected') {
        qb.andWhere('product.approvalStatus = :approvalStatus', {
          approvalStatus: ApprovalStatus.REJECTED,
        });
      } else if (status === 'delisted') {
        qb.andWhere('product.adminDisabled = true');
      } else if (status === 'active') {
        qb.andWhere('product.productStatus = :pStatus', { pStatus });
        qb.andWhere('product.approvalStatus = :approvalStatus', {
          approvalStatus: ApprovalStatus.APPROVED,
        });
        qb.andWhere('product.adminDisabled = false');
      } else {
        qb.andWhere('product.productStatus = :pStatus', { pStatus });
      }
    }

    if (category && category !== 'all') {
      qb.andWhere('product.category = :category', { category });
    }

    const [products, total] = await qb.getManyAndCount();

    const mappedData: AdminProductDto[] = products.map((p) => ({
      id: p.id,
      name: p.title,
      businessName: p.business?.businessName || 'Unknown',
      businessId: p.business?.id || '',
      category: p.category,
      price: p.price,
      stock: p.stock,
      status:
        p.adminDisabled || p.approvalStatus !== ApprovalStatus.APPROVED
          ? 'inactive'
          : p.productStatus === 'published'
            ? 'active'
            : p.stock === 0
              ? 'out_of_stock'
              : 'inactive',
      description: p.description,
      images: p.media || [],
      approvalStatus: p.approvalStatus,
      adminDisabled: p.adminDisabled,
      reviewNote: p.reviewNote ?? null,
      reviewedAt: p.reviewedAt ?? null,
      createdAt: p.created_at,
    }));

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deactivate(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.productsRepository.update(id, { adminDisabled: true });
  }

  async activate(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    // The legacy admin "Activate" action both republishes a delisted product
    // and approves it when it is still awaiting review. Dedicated
    // approve/reject endpoints remain available for explicit moderation.
    return this.productsRepository.update(id, {
      adminDisabled: false,
      approvalStatus: ApprovalStatus.APPROVED,
      reviewedAt: new Date(),
    });
  }

  async approve(id: string, reviewerId: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.productsRepository.update(id, {
      approvalStatus: ApprovalStatus.APPROVED,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    });
  }

  async reject(id: string, reviewerId: string, reviewNote?: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.productsRepository.update(id, {
      approvalStatus: ApprovalStatus.REJECTED,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: reviewNote ?? null,
    });
  }

  async remove(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.productsRepository.softDelete(id);
  }
}
