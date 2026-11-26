import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import {
  DeepPartial,
  EntityManager,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { PromotionalOffer } from '../promotional-offer/entities/promotional-offer.entity';
import { Sector } from './entities/sector.entity';
import { TaxonomyCategory } from './entities/taxonomy-category.entity';
import { TaxonomySubcategory } from './entities/taxonomy-subcategory.entity';

interface CentralTaxonomyNode {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface CentralSectorNode extends CentralTaxonomyNode {}

interface CentralCategoryNode extends CentralTaxonomyNode {
  sectorId: string;
}

interface CentralSubcategoryNode extends CentralTaxonomyNode {
  categoryId: string;
}

interface SyncableTaxonomyRow {
  id: string;
  name: string;
  centralId?: string | null;
  centralSlug?: string | null;
  centralSyncedAt?: Date | null;
  deleted_at?: Date | null;
}

export interface CentralTaxonomySyncResult {
  sectors: { added: number; linked: number };
  categories: { added: number; linked: number };
  subcategories: { added: number; linked: number };
  skipped: number;
  durationMs: number;
}

/**
 * Mirrors sectors/categories/subcategories from MCOM Central Hub into the
 * mall's local taxonomy tables. Central's public catalog endpoints have no
 * delta parameter, so each run fetches the lists and only writes rows that are
 * not already linked to a Central ID. Existing rows are never renamed.
 */
@Injectable()
export class CentralTaxonomySyncService {
  private readonly logger = new Logger(CentralTaxonomySyncService.name);
  private syncInProgress = false;

  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(TaxonomyCategory)
    private readonly categoryRepository: Repository<TaxonomyCategory>,
    @InjectRepository(TaxonomySubcategory)
    private readonly subcategoryRepository: Repository<TaxonomySubcategory>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'central-taxonomy-sync',
    waitForCompletion: true,
  })
  async handleScheduledSync(): Promise<void> {
    try {
      const result = await this.syncFromCentral();
      this.logger.log(
        `Central taxonomy sync complete: ${result.sectors.added} sectors, ` +
          `${result.categories.added} categories and ` +
          `${result.subcategories.added} subcategories added ` +
          `(${result.skipped} skipped) in ${result.durationMs}ms`,
      );
    } catch (error) {
      this.logger.error(
        'Central taxonomy sync failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async syncFromCentral(): Promise<CentralTaxonomySyncResult> {
    if (this.syncInProgress) {
      throw new Error('A Central taxonomy sync is already running');
    }

    this.syncInProgress = true;
    try {
      return await this.performSync();
    } finally {
      this.syncInProgress = false;
    }
  }

  private async performSync(): Promise<CentralTaxonomySyncResult> {
    const startedAt = Date.now();

    const centralSectors = await this.fetchCatalog<CentralSectorNode>('/sectors');
    const centralCategories =
      await this.fetchCatalog<CentralCategoryNode>('/categories');
    const centralSubcategories =
      await this.fetchCatalog<CentralSubcategoryNode>('/subcategories');

    return this.sectorRepository.manager.transaction(async (manager) => {
      const sectorRepo = manager.getRepository(Sector);
      const categoryRepo = manager.getRepository(TaxonomyCategory);
      const subcategoryRepo = manager.getRepository(TaxonomySubcategory);

      const syncedAt = new Date();
      const result: CentralTaxonomySyncResult = {
        sectors: { added: 0, linked: 0 },
        categories: { added: 0, linked: 0 },
        subcategories: { added: 0, linked: 0 },
        skipped: 0,
        durationMs: 0,
      };

      const existingSectors = await sectorRepo.find({ withDeleted: true });
      const localSectorByCentralId = new Map<string, Sector>();

      for (const node of centralSectors) {
        const outcome = await this.linkOrCreate<Sector>(
          sectorRepo,
          existingSectors,
          node,
          (candidate) => this.sameName(candidate.name, node.name),
          () => ({
            name: node.name,
            image: node.imageUrl || undefined,
          }),
          syncedAt,
        );

        if (outcome.created) result.sectors.added += 1;
        if (outcome.linked) result.sectors.linked += 1;
        if (!outcome.entity) {
          result.skipped += 1;
          continue;
        }

        existingSectors.push(outcome.entity);
        localSectorByCentralId.set(node.id, outcome.entity);
      }

      const existingCategories = await categoryRepo.find({ withDeleted: true });
      const localCategoryByCentralId = new Map<string, TaxonomyCategory>();

      for (const node of centralCategories) {
        const sector = localSectorByCentralId.get(node.sectorId);
        if (!sector) {
          this.logger.warn(
            `Skipping Central category "${node.name}": sector "${node.sectorId}" is not mirrored yet`,
          );
          result.skipped += 1;
          continue;
        }

        const outcome = await this.linkOrCreate<TaxonomyCategory>(
          categoryRepo,
          existingCategories,
          node,
          (candidate) =>
            candidate.sectorId === sector.id &&
            this.sameName(candidate.name, node.name),
          () => ({
            name: node.name,
            image: node.imageUrl || undefined,
            sectorId: sector.id,
          }),
          syncedAt,
        );

        if (outcome.created) result.categories.added += 1;
        if (outcome.linked) result.categories.linked += 1;
        if (!outcome.entity) {
          result.skipped += 1;
          continue;
        }

        existingCategories.push(outcome.entity);
        localCategoryByCentralId.set(node.id, outcome.entity);
      }

      const existingSubcategories = await subcategoryRepo.find({
        withDeleted: true,
      });

      for (const node of centralSubcategories) {
        const category = localCategoryByCentralId.get(node.categoryId);
        if (!category) {
          this.logger.warn(
            `Skipping Central subcategory "${node.name}": category "${node.categoryId}" is not mirrored yet`,
          );
          result.skipped += 1;
          continue;
        }

        const outcome = await this.linkOrCreate<TaxonomySubcategory>(
          subcategoryRepo,
          existingSubcategories,
          node,
          (candidate) =>
            candidate.categoryId === category.id &&
            this.sameName(candidate.name, node.name),
          () => ({
            name: node.name,
            image: node.imageUrl || undefined,
            categoryId: category.id,
          }),
          syncedAt,
        );

        if (outcome.created) result.subcategories.added += 1;
        if (outcome.linked) result.subcategories.linked += 1;
        if (!outcome.entity) result.skipped += 1;
      }

      await this.backfillOfferTaxonomyIds(manager);

      result.durationMs = Date.now() - startedAt;
      return result;
    });
  }

  /**
   * The promotional-offer migration backfills IDs from names once, but it may
   * run before the first sync. Re-running the name match after each sync makes
   * the backfill independent of migration order.
   */
  private async backfillOfferTaxonomyIds(manager: EntityManager): Promise<void> {
    const statements = [
      `UPDATE "promotional_offers" AS offer
       SET "sectorId" = sector."centralId"
       FROM "sectors" AS sector
       WHERE offer."sectorId" IS NULL
         AND sector."centralId" IS NOT NULL
         AND lower(btrim(offer."sector")) = lower(btrim(sector."name"))`,
      `UPDATE "promotional_offers" AS offer
       SET "categoryId" = category."centralId"
       FROM "taxonomy_categories" AS category
       WHERE offer."categoryId" IS NULL
         AND category."centralId" IS NOT NULL
         AND lower(btrim(offer."category")) = lower(btrim(category."name"))`,
      `UPDATE "promotional_offers" AS offer
       SET "subCategoryId" = subcategory."centralId"
       FROM "taxonomy_subcategories" AS subcategory
       WHERE offer."subCategoryId" IS NULL
         AND subcategory."centralId" IS NOT NULL
         AND lower(btrim(offer."subCategory")) = lower(btrim(subcategory."name"))`,
    ];

    try {
      for (const statement of statements) {
        await manager.query(statement);
      }
    } catch (error) {
      this.logger.warn(
        'Could not backfill promotional offer taxonomy IDs',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async fetchCatalog<T extends CentralTaxonomyNode>(
    path: string,
  ): Promise<T[]> {
    const baseUrl = (
      process.env.MCOM_SOLUTIONS_BACKEND_URL ||
      process.env.MCOM_SOLUTIONS_URL ||
      'http://localhost:3010'
    ).replace(/\/$/, '');

    const { data } = await axios.get<T[]>(`${baseUrl}/api/v1${path}`, {
      timeout: 15000,
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!Array.isArray(data)) {
      throw new Error(`Central Hub ${path} did not return an array`);
    }

    return data.filter((node) => !!node?.id && !!node?.name);
  }

  private sameName(localName: string, centralName: string): boolean {
    return localName.trim().toLowerCase() === centralName.trim().toLowerCase();
  }

  /**
   * Links a Central node to an existing local row with the same name/parent,
   * inserts it when no such row exists, and does nothing when it is already
   * linked. Rows that belong to a different Central node are never overwritten.
   */
  private async linkOrCreate<T extends ObjectLiteral & SyncableTaxonomyRow>(
    repository: Repository<T>,
    existing: T[],
    node: CentralTaxonomyNode,
    matchesLocalRow: (candidate: T) => boolean,
    buildNewRow: () => DeepPartial<T>,
    syncedAt: Date,
  ): Promise<{
    entity: T | null;
    created: boolean;
    linked: boolean;
  }> {
    const alreadyLinked = existing.find(
      (row) => row.centralId === node.id,
    );
    if (alreadyLinked) {
      if (alreadyLinked.deleted_at) {
        await repository.restore(alreadyLinked.id);
      }
      return { entity: alreadyLinked, created: false, linked: false };
    }

    const conflictingRow = existing.find(
      (row) => !!row.centralId && matchesLocalRow(row),
    );
    if (conflictingRow) {
      this.logger.warn(
        `Skipping Central "${node.name}" (${node.id}): local row ` +
          `"${conflictingRow.name}" is already linked to Central ID ` +
          `"${conflictingRow.centralId}"`,
      );
      return { entity: null, created: false, linked: false };
    }

    const candidate = existing.find(
      (row) => !row.centralId && matchesLocalRow(row),
    );

    if (candidate) {
      const wasDeleted = !!candidate.deleted_at;
      candidate.centralId = node.id;
      candidate.centralSlug = node.slug;
      candidate.centralSyncedAt = syncedAt;
      if (wasDeleted) {
        await repository.restore(candidate.id);
        candidate.deleted_at = null;
      }
      const saved = await repository.save(candidate);
      return { entity: saved, created: false, linked: true };
    }

    const newRow = repository.create({
      ...buildNewRow(),
      centralId: node.id,
      centralSlug: node.slug,
      centralSyncedAt: syncedAt,
    } as DeepPartial<T>);
    const saved = await repository.save(newRow);
    return { entity: saved, created: true, linked: false };
  }
}
