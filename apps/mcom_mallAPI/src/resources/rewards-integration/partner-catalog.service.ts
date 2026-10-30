import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';

export interface PartnerCatalogQuery {
  query?: string;
  page?: number | string;
  limit?: number | string;
  businessId?: string;
  status?: string;
}

export interface PartnerPageMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Partner-facing read model over the mall catalogue. Identifies a business by
 * its owner's MCOM Central user id (preferred) or email, then exposes the
 * business's products/services for reward targeting.
 */
@Injectable()
export class PartnerCatalogService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async getBusiness(identity: {
    mcomUserId?: string;
    email?: string;
  }): Promise<any> {
    const business = await this.resolveBusiness(identity);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const [products, services] = await Promise.all([
      this.listProducts(business.id),
      this.listServices(business.id),
    ]);

    return {
      business: {
        id: business.id,
        name: business.businessName,
        email: business.businessEmail ?? null,
        mcomUserId: business.user?.centralUserId ?? null,
      },
      products,
      services,
    };
  }

  async listProducts(businessId: string): Promise<any[]> {
    const products = await this.productRepository.find({
      where: { business: { id: businessId } },
      order: { created_at: 'DESC' },
    });
    return products.map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku ?? null,
      price: Number(p.price),
      salePrice: p.salePrice !== undefined && p.salePrice !== null ? Number(p.salePrice) : null,
      productType: p.productType ?? null,
      status: p.productStatus ?? null,
      image: Array.isArray(p.media) && p.media.length > 0 ? p.media[0] : null,
    }));
  }

  async listServices(businessId: string): Promise<any[]> {
    const services = await this.serviceRepository.find({
      where: { businessId },
      order: { created_at: 'DESC' },
    });
    return services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category ?? null,
      pricingModel: s.pricingModel,
      fixedPrice: s.fixedPrice !== undefined && s.fixedPrice !== null ? Number(s.fixedPrice) : null,
      basePrice: s.basePrice !== undefined && s.basePrice !== null ? Number(s.basePrice) : null,
      status: s.status ?? null,
      image: Array.isArray(s.media) && s.media.length > 0 ? s.media[0] : null,
    }));
  }

  // ─── Global (platform-admin) catalogue ─────────────────────────────────

  async listListingsPaginated(params: {
    query?: string;
    page?: number | string;
    limit?: number | string;
    businessId?: string;
    status?: string;
  }): Promise<{ data: any[]; meta: PartnerPageMeta }> {
    const { page, limit } = pagination(params.page, params.limit);
    const status = (params.status || 'published').toLowerCase();

    const qb = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.user', 'user')
      .loadRelationCountAndMap(
        'business.productCount',
        'business.products',
        'product',
        (sub) => sub.where('product.productStatus = :published', { published: 'published' }),
      )
      .loadRelationCountAndMap(
        'business.serviceCount',
        'business.services',
        'service',
        (sub) => sub.where('service.status = :published', { published: 'published' }),
      );

    if (status !== 'all') {
      qb.andWhere('business.status = :status', { status });
    }
    if (params.businessId) {
      qb.andWhere('business.id = :businessId', { businessId: params.businessId });
    }
    if (params.query) {
      qb.andWhere('business.businessName ILIKE :query', {
        query: `%${params.query.trim()}%`,
      });
    }

    const totalItems = await qb.getCount();
    const rows = await qb
      .orderBy('business.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: rows.map((business) => ({
        id: business.id,
        name: business.businessName,
        mcomUserId: business.user?.centralUserId ?? null,
        email: business.businessEmail ?? null,
        status: business.status,
        logo: business.logoUrl ?? null,
        productCount: (business as any).productCount ?? 0,
        serviceCount: (business as any).serviceCount ?? 0,
      })),
      meta: pageMeta(rows.length, totalItems, limit, page),
    };
  }

  async getListingDetail(businessId: string): Promise<any> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) throw new NotFoundException('Listing not found.');

    const [products, services] = await Promise.all([
      this.listProducts(businessId),
      this.listServices(businessId),
    ]);

    return {
      id: business.id,
      name: business.businessName,
      mcomUserId: business.user?.centralUserId ?? null,
      email: business.businessEmail ?? null,
      status: business.status,
      logo: business.logoUrl ?? null,
      products,
      services,
    };
  }

  async listProductsPaginated(params: {
    query?: string;
    page?: number | string;
    limit?: number | string;
    businessId?: string;
    status?: string;
  }): Promise<{ data: any[]; meta: PartnerPageMeta }> {
    const { page, limit } = pagination(params.page, params.limit);
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.business', 'business');

    if ((params.status || 'published').toLowerCase() !== 'all') {
      qb.andWhere('LOWER(product.productStatus) = :status', {
        status: (params.status || 'published').toLowerCase(),
      });
    }
    if (params.businessId) {
      qb.andWhere('business.id = :businessId', { businessId: params.businessId });
    }
    if (params.query) {
      qb.andWhere('product.title ILIKE :query', {
        query: `%${params.query.trim()}%`,
      });
    }

    const totalItems = await qb.getCount();
    const rows = await qb
      .orderBy('product.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: rows.map((product) => ({
        id: product.id,
        businessId: product.business?.id ?? null,
        businessName: product.business?.businessName ?? null,
        title: product.title,
        sku: product.sku ?? null,
        price: Number(product.price),
        salePrice:
          product.salePrice !== undefined && product.salePrice !== null
            ? Number(product.salePrice)
            : null,
        productType: product.productType ?? null,
        status: product.productStatus ?? null,
        image: Array.isArray(product.media) && product.media.length > 0 ? product.media[0] : null,
      })),
      meta: pageMeta(rows.length, totalItems, limit, page),
    };
  }

  async listServicesPaginated(params: {
    query?: string;
    page?: number | string;
    limit?: number | string;
    businessId?: string;
    status?: string;
  }): Promise<{ data: any[]; meta: PartnerPageMeta }> {
    const { page, limit } = pagination(params.page, params.limit);
    const qb = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.business', 'business');

    if ((params.status || 'published').toLowerCase() !== 'all') {
      qb.andWhere('LOWER(service.status) = :status', {
        status: (params.status || 'published').toLowerCase(),
      });
    }
    if (params.businessId) {
      qb.andWhere('business.id = :businessId', { businessId: params.businessId });
    }
    if (params.query) {
      qb.andWhere('service.name ILIKE :query', {
        query: `%${params.query.trim()}%`,
      });
    }

    const totalItems = await qb.getCount();
    const rows = await qb
      .orderBy('service.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: rows.map((service) => ({
        id: service.id,
        businessId: service.businessId,
        businessName: service.business?.businessName ?? null,
        name: service.name,
        category: service.category ?? null,
        pricingModel: service.pricingModel,
        fixedPrice:
          service.fixedPrice !== undefined && service.fixedPrice !== null
            ? Number(service.fixedPrice)
            : null,
        basePrice:
          service.basePrice !== undefined && service.basePrice !== null
            ? Number(service.basePrice)
            : null,
        status: service.status ?? null,
        image:
          Array.isArray(service.media) && service.media.length > 0
            ? service.media[0]
            : null,
      })),
      meta: pageMeta(rows.length, totalItems, limit, page),
    };
  }

  private async resolveBusiness(identity: {
    mcomUserId?: string;
    email?: string;
  }): Promise<Business | null> {
    if (identity.mcomUserId) {
      const byCentral = await this.businessRepository.findOne({
        where: { user: { centralUserId: identity.mcomUserId } },
        relations: ['user'],
      });
      if (byCentral) return byCentral;
    }
    if (identity.email) {
      const byEmail = await this.businessRepository.findOne({
        where: { businessEmail: identity.email.toLowerCase().trim() },
        relations: ['user'],
      });
      if (byEmail) return byEmail;
    }
    return null;
  }
}

function pagination(
  rawPage?: number | string,
  rawLimit?: number | string,
): { page: number; limit: number } {
  const page = Math.max(1, Math.floor(Number(rawPage) || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(Number(rawLimit) || 20)));
  return { page, limit };
}

function pageMeta(
  itemCount: number,
  totalItems: number,
  itemsPerPage: number,
  currentPage: number,
): PartnerPageMeta {
  return {
    itemCount,
    totalItems,
    itemsPerPage,
    totalPages: Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    currentPage,
  };
}
