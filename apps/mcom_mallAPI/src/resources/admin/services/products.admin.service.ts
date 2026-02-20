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

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getStats(): Promise<ProductStatsDto> {
    const [total, active, outOfStock] = await Promise.all([
      this.productsRepository.count(),
      this.productsRepository.count({ where: { productStatus: 'published' } }),
      this.productsRepository.count({ where: { stock: 0 } }),
    ]);

    return { total, active, outOfStock };
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
      if (status === 'inactive') pStatus = 'draft';

      if (status === 'out_of_stock') {
        qb.andWhere('product.stock = 0');
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
        p.productStatus === 'published'
          ? 'active'
          : p.stock === 0
            ? 'out_of_stock'
            : 'inactive',
      description: p.description,
      images: p.media || [],
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
    return this.productsRepository.update(id, { productStatus: 'draft' });
  }

  async remove(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.productsRepository.softDelete(id);
  }
}
