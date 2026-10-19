import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';

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
