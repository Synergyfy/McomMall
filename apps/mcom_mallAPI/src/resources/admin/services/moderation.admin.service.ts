import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Service } from '../../services/entities/service.entity';
import { GiftCardTemplate } from '../../gift-card/entities/gift-card-template.entity';
import { VoucherProduct } from '../../voucher/entities/voucher-product.entity';
import { CouponProduct } from '../../coupon/entities/coupon-product.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { ApprovalStatus } from '../../../common/moderation/catalog-approval';
import { ModerationQueryDto, ReviewModerationDto } from '../dto/moderation.dto';

export enum ModeratedResource {
  PRODUCTS = 'products',
  SERVICES = 'services',
  GIFT_CARD_TEMPLATES = 'gift-card-templates',
  VOUCHER_PRODUCTS = 'voucher-products',
  COUPON_PRODUCTS = 'coupon-products',
  COUPONS = 'coupons',
  OFFERS = 'offers',
  TIME_BONUSES = 'time-bonuses',
}

interface JoinConfig {
  path: string;
  alias: string;
}

interface ResourceConfig {
  entity: EntityTarget<ObjectLiteral>;
  alias: string;
  namePath: string;
  searchColumns: string[];
  joins: JoinConfig[];
  ownerPath?: string;
  businessPath?: string;
  businessNamePath?: string;
  itemStatus: (entity: any) => string | null;
  /** Property name for ordering. Most entities use the base `created_at`. */
  createdAtPath?: string;
  extraWhere?: {
    sql: string;
    params?: Record<string, unknown>;
  };
}

export interface ModeratedItemSummary {
  id: string;
  name: string;
  description: string | null;
  approvalStatus: ApprovalStatus;
  adminDisabled: boolean;
  itemStatus: string | null;
  ownerId: string | null;
  businessId: string | null;
  businessName: string | null;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date | null;
}

@Injectable()
export class CatalogModerationService {
  constructor(private readonly dataSource: DataSource) {}

  private readonly resources: Record<ModeratedResource, ResourceConfig> = {
    [ModeratedResource.PRODUCTS]: {
      entity: Product,
      alias: 'product',
      namePath: 'title',
      searchColumns: [
        'product.title',
        'product.shortDescription',
        'product.sku',
        'business.businessName',
      ],
      joins: [
        { path: 'product.business', alias: 'business' },
        { path: 'business.user', alias: 'owner' },
      ],
      ownerPath: 'business.user',
      businessPath: 'business.id',
      businessNamePath: 'business.businessName',
      itemStatus: (p) => p.productStatus ?? null,
    },
    [ModeratedResource.SERVICES]: {
      entity: Service,
      alias: 'service',
      namePath: 'name',
      searchColumns: [
        'service.name',
        'service.description',
        'business.businessName',
      ],
      joins: [
        { path: 'service.business', alias: 'business' },
        { path: 'business.user', alias: 'owner' },
      ],
      ownerPath: 'business.user',
      businessPath: 'business.id',
      businessNamePath: 'business.businessName',
      itemStatus: (s) =>
        s.status ? `${s.status}${s.isActive ? '' : ' (inactive)'}` : null,
    },
    [ModeratedResource.GIFT_CARD_TEMPLATES]: {
      entity: GiftCardTemplate,
      alias: 'template',
      namePath: 'name',
      searchColumns: ['template.name', 'template.description'],
      joins: [{ path: 'template.owner', alias: 'owner' }],
      ownerPath: 'owner',
      itemStatus: (t) => (t.isActive ? 'active' : 'inactive'),
    },
    [ModeratedResource.VOUCHER_PRODUCTS]: {
      entity: VoucherProduct,
      alias: 'voucherProduct',
      namePath: 'name',
      searchColumns: ['voucherProduct.name', 'voucherProduct.description'],
      joins: [{ path: 'voucherProduct.user', alias: 'owner' }],
      ownerPath: 'owner',
      createdAtPath: 'createdAt',
      itemStatus: (p) =>
        p.isEnabled === false ? 'disabled' : (p.status ?? null),
    },
    [ModeratedResource.COUPON_PRODUCTS]: {
      entity: CouponProduct,
      alias: 'couponProduct',
      namePath: 'name',
      searchColumns: ['couponProduct.name', 'couponProduct.description'],
      joins: [{ path: 'couponProduct.user', alias: 'owner' }],
      ownerPath: 'owner',
      createdAtPath: 'createdAt',
      itemStatus: (p) => (p.isEnabled ? 'active' : 'inactive'),
    },
    [ModeratedResource.COUPONS]: {
      entity: Coupon,
      alias: 'coupon',
      namePath: 'title',
      searchColumns: ['coupon.title', 'coupon.code', 'business.businessName'],
      joins: [
        { path: 'coupon.business', alias: 'business' },
        { path: 'business.user', alias: 'owner' },
      ],
      ownerPath: 'business.user',
      businessPath: 'business.id',
      businessNamePath: 'business.businessName',
      itemStatus: (c) => c.status ?? null,
      // Only coupon templates are moderated. Issued/purchased coupons are
      // customer entitlements and must not appear in the approval queue.
      extraWhere: {
        sql: `coupon.issuanceId IS NULL AND (coupon.metadata IS NULL OR coupon.metadata ->> 'buyerId' IS NULL)`,
      },
    },
    [ModeratedResource.OFFERS]: {
      entity: Offer,
      alias: 'offer',
      namePath: 'name',
      searchColumns: ['offer.name', 'offer.description'],
      joins: [{ path: 'offer.user', alias: 'owner' }],
      ownerPath: 'owner',
      itemStatus: (o) => (o.isActive ? 'active' : 'inactive'),
      extraWhere: {
        sql: 'offer.isTimeBonus = :isTimeBonus',
        params: { isTimeBonus: false },
      },
    },
    [ModeratedResource.TIME_BONUSES]: {
      entity: Offer,
      alias: 'offer',
      namePath: 'name',
      searchColumns: ['offer.name', 'offer.description'],
      joins: [{ path: 'offer.user', alias: 'owner' }],
      ownerPath: 'owner',
      itemStatus: (o) => (o.isActive ? 'active' : 'inactive'),
      extraWhere: {
        sql: 'offer.isTimeBonus = :isTimeBonus',
        params: { isTimeBonus: true },
      },
    },
  };

  private configFor(resource: string): ResourceConfig {
    const config = this.resources[resource as ModeratedResource];
    if (!config) {
      throw new BadRequestException(
        `Unknown moderated resource "${resource}". Supported values: ${Object.values(
          ModeratedResource,
        ).join(', ')}.`,
      );
    }
    return config;
  }

  private repository(config: ResourceConfig) {
    return this.dataSource.getRepository(config.entity);
  }

  private baseQuery(config: ResourceConfig) {
    const qb = this.repository(config).createQueryBuilder(config.alias);
    for (const join of config.joins) {
      qb.leftJoinAndSelect(join.path, join.alias);
    }
    if (config.extraWhere) {
      qb.andWhere(config.extraWhere.sql, config.extraWhere.params);
    }
    return qb;
  }

  async findAll(resource: string, query: ModerationQueryDto) {
    const config = this.configFor(resource);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const qb = this.baseQuery(config);

    if (query.approvalStatus) {
      qb.andWhere(`${config.alias}.approvalStatus = :approvalStatus`, {
        approvalStatus: query.approvalStatus,
      });
    }

    if (query.delisted !== undefined) {
      const delisted =
        query.delisted === true ||
        String(query.delisted).toLowerCase() === 'true';
      qb.andWhere(`${config.alias}.adminDisabled = :adminDisabled`, {
        adminDisabled: delisted,
      });
    }

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere(
        `(${config.searchColumns
          .map((column) => `${column} ILIKE :search`)
          .join(' OR ')})`,
        { search: term },
      );
    }

    const [items, total] = await qb
      .orderBy(`${config.alias}.${config.createdAtPath ?? 'created_at'}`, 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items.map((item) => this.toSummary(config, item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const entries = await Promise.all(
      Object.entries(this.resources).map(async ([resource, config]) => {
        const repo = this.repository(config);
        const base = () => {
          const qb = repo.createQueryBuilder(config.alias);
          if (config.extraWhere) {
            qb.where(config.extraWhere.sql, config.extraWhere.params);
          }
          return qb;
        };

        const [total, pending, approved, rejected, delisted] =
          await Promise.all([
            base().getCount(),
            base()
              .andWhere(`${config.alias}.approvalStatus = :status`, {
                status: ApprovalStatus.PENDING,
              })
              .getCount(),
            base()
              .andWhere(`${config.alias}.approvalStatus = :status`, {
                status: ApprovalStatus.APPROVED,
              })
              .getCount(),
            base()
              .andWhere(`${config.alias}.approvalStatus = :status`, {
                status: ApprovalStatus.REJECTED,
              })
              .getCount(),
            base()
              .andWhere(`${config.alias}.adminDisabled = :disabled`, {
                disabled: true,
              })
              .getCount(),
          ]);

        return { resource, total, pending, approved, rejected, delisted };
      }),
    );

    return {
      resources: entries,
      totals: entries.reduce(
        (acc, entry) => ({
          total: acc.total + entry.total,
          pending: acc.pending + entry.pending,
          approved: acc.approved + entry.approved,
          rejected: acc.rejected + entry.rejected,
          delisted: acc.delisted + entry.delisted,
        }),
        { total: 0, pending: 0, approved: 0, rejected: 0, delisted: 0 },
      ),
    };
  }

  async approve(
    resource: string,
    id: string,
    reviewerId: string,
    dto: ReviewModerationDto = {},
  ) {
    const config = this.configFor(resource);
    const item = await this.findEntity(config, id);
    item.approvalStatus = ApprovalStatus.APPROVED;
    item.reviewedBy = reviewerId;
    item.reviewedAt = new Date();
    if (dto.reviewNote !== undefined) {
      item.reviewNote = dto.reviewNote ?? null;
    }
    await this.repository(config).save(item);
    return this.toSummary(config, item);
  }

  async reject(
    resource: string,
    id: string,
    reviewerId: string,
    dto: ReviewModerationDto = {},
  ) {
    const config = this.configFor(resource);
    const item = await this.findEntity(config, id);
    item.approvalStatus = ApprovalStatus.REJECTED;
    item.reviewedBy = reviewerId;
    item.reviewedAt = new Date();
    item.reviewNote = dto.reviewNote ?? null;
    await this.repository(config).save(item);
    return this.toSummary(config, item);
  }

  async delist(resource: string, id: string) {
    const config = this.configFor(resource);
    const item = await this.findEntity(config, id);
    item.adminDisabled = true;
    await this.repository(config).save(item);
    return this.toSummary(config, item);
  }

  async republish(resource: string, id: string) {
    const config = this.configFor(resource);
    const item = await this.findEntity(config, id);
    item.adminDisabled = false;
    await this.repository(config).save(item);
    return this.toSummary(config, item);
  }

  private async findEntity(config: ResourceConfig, id: string): Promise<any> {
    const qb = this.baseQuery(config).where(`${config.alias}.id = :id`, { id });
    const item = await qb.getOne();
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  private toSummary(config: ResourceConfig, item: any): ModeratedItemSummary {
    const owner = config.ownerPath ? valueAt(item, config.ownerPath) : null;
    return {
      id: item.id,
      name: valueAt(item, config.namePath) ?? '',
      description: item.description ?? null,
      approvalStatus: item.approvalStatus,
      adminDisabled: !!item.adminDisabled,
      itemStatus: config.itemStatus(item),
      ownerId: owner?.id ?? null,
      businessId: config.businessPath
        ? (valueAt(item, config.businessPath) ?? null)
        : null,
      businessName: config.businessNamePath
        ? (valueAt(item, config.businessNamePath) ?? null)
        : null,
      reviewNote: item.reviewNote ?? null,
      reviewedBy: item.reviewedBy ?? null,
      reviewedAt: item.reviewedAt ?? null,
      createdAt: item.created_at ?? item.createdAt ?? null,
    };
  }
}

function valueAt(source: any, path: string): any {
  return path.split('.').reduce((value, key) => value?.[key], source);
}
