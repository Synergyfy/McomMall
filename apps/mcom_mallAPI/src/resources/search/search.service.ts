import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async search(
    query: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Product | Service>> {
    if (!query || query.trim() === '') {
      return {
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: options.limit,
          totalPages: 0,
          currentPage: options.page,
        },
      };
    }

    const { page, limit } = options;
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;

    const entityManager = this.productRepository.manager;

    const baseQuery = `
      (SELECT id, created_at, 'product' as type FROM "Products" WHERE "title" ILIKE $1 OR "shortDescription" ILIKE $1 OR "description" ILIKE $1 OR "category" ILIKE $1 OR "tags" ILIKE $1)
      UNION ALL
      (SELECT id, created_at, 'service' as type FROM "services" WHERE "name" ILIKE $1 OR "description" ILIKE $1)
    `;

    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) as combined_results`;
    const countResult = await entityManager.query(countQuery, [searchTerm]);
    const totalItems = parseInt(countResult[0].count, 10);

    if (totalItems === 0) {
      return {
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
      };
    }

    const mainQuery = `
      SELECT * FROM (${baseQuery}) as combined_results
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const paginatedIds = await entityManager.query(mainQuery, [
      searchTerm,
      limit,
      offset,
    ]);

    const productIds = paginatedIds
      .filter((r) => r.type === 'product')
      .map((r) => r.id);
    const serviceIds = paginatedIds
      .filter((r) => r.type === 'service')
      .map((r) => r.id);

    const [products, services] = await Promise.all([
      productIds.length > 0
        ? this.productRepository.findBy({ id: In(productIds) })
        : Promise.resolve([]),
      serviceIds.length > 0
        ? this.serviceRepository.findBy({ id: In(serviceIds) })
        : Promise.resolve([]),
    ]);

    const combinedResults = [...products, ...services];

    const sortedResults = combinedResults.sort((a, b) => {
      const aIndex = paginatedIds.findIndex((r) => r.id === a.id);
      const bIndex = paginatedIds.findIndex((r) => r.id === b.id);
      return aIndex - bIndex;
    });

    return {
      items: sortedResults,
      meta: {
        totalItems,
        itemCount: sortedResults.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }
}
