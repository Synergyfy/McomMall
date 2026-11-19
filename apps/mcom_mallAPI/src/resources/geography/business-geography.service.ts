import { Injectable, Logger } from '@nestjs/common';
import { Interval, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Location } from '../listings/entities/location.entity';
import { McomCentralService } from '../sso/mcom-central.service';
import { GeoPostcodeResolution } from './entities/geo-postcode-resolution.entity';

/** The geographic slice of Central's `GET /data/local-mall` response. */
export interface CentralHierarchy {
  city?: { id?: string | null; name?: string | null } | null;
  borough?: { id?: string | null; name?: string | null } | null;
  highStreet?: {
    id?: string | null;
    name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  mall?: { id?: string | null; name?: string | null } | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BackfillSummary {
  outcodes: number;
  businessesUpdated: number;
  skipped: number;
  failed: number;
  /** False when another API instance is already running the worker. */
  locked: boolean;
}

export interface BusinessGeoPatch {
  geoCityId: string | null;
  geoCityName: string | null;
  geoBoroughId: string | null;
  geoBoroughName: string | null;
  geoHighStreetId: string | null;
  geoHighStreetName: string | null;
  geoLocalMallId: string | null;
  geoLocalMallName: string | null;
  geoLatitude: number | null;
  geoLongitude: number | null;
  geoResolvedAt: Date;
}

const OUTCODE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BUSINESS_REFRESH_MS = 24 * 60 * 60 * 1000;

/** Arbitrary but stable key shared by every API instance. */
const BACKFILL_ADVISORY_LOCK = 734921501;
const BACKFILL_INTERVAL_MS = 10 * 60 * 1000;
const BACKFILL_STARTUP_DELAY_MS = 30 * 1000;
const DEFAULT_BACKFILL_BATCH = 25;

/**
 * Writes Central's City → Borough → High Street → Local Mall assignment onto
 * the local `businesses` row.
 *
 * Two traffic paths feed this service:
 *  - SSO login: one Central lookup per business user, refreshed at most once
 *    a day, so the denormalised copy tracks Central's canonical assignment.
 *  - Backfill worker: one Central lookup per UK outward code (not per
 *    business), cached for a week, so existing catalogues can be migrated
 *    without a Central stampede.
 */
@Injectable()
export class BusinessGeographyService {
  private readonly logger = new Logger(BusinessGeographyService.name);
  private backfillRunning = false;

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(GeoPostcodeResolution)
    private readonly resolutionRepository: Repository<GeoPostcodeResolution>,
    private readonly central: McomCentralService,
  ) {}

  /**
   * Mirrors Central's assignment for one business. Safe to call on every SSO
   * login; skips the network call when the local copy is fresh and complete.
   */
  async syncBusinessFromCentral(params: {
    businessId: string;
    centralUserId?: string | null;
    postcode?: string | null;
    force?: boolean;
  }): Promise<BusinessGeoPatch | null> {
    const { businessId, centralUserId, postcode, force } = params;

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      select: [
        'id',
        'geoCityId',
        'geoBoroughId',
        'geoHighStreetId',
        'geoLocalMallId',
        'geoResolvedAt',
      ],
    });
    if (!business) return null;

    if (!force && this.isFresh(business)) return null;

    let hierarchy: CentralHierarchy | null = null;
    if (centralUserId || postcode) {
      hierarchy = await this.central.getLocalMallOrResolvePostcode({
        userId: centralUserId || null,
        postcode: postcode || null,
      });
    }
    if (!hierarchy) return null;

    return this.applyHierarchy(businessId, hierarchy);
  }

  /** Persist a hierarchy returned by Central (also used by admin tooling). */
  async applyHierarchy(
    businessId: string,
    hierarchy: CentralHierarchy,
  ): Promise<BusinessGeoPatch> {
    const patch = this.toPatch(hierarchy);
    await this.businessRepository.update(businessId, patch);
    return patch;
  }

  /**
   * Resolves and applies the hierarchy for a list of businesses by outcode.
   * Returns a small summary so callers (admin endpoint / scheduler) can log or
   * display progress without loading business rows.
   */
  async backfill(batchSize = DEFAULT_BACKFILL_BATCH): Promise<BackfillSummary> {
    // Postgres advisory locks are cluster-wide: if several API instances run
    // the worker, only one of them performs the Central lookups at a time.
    const runner = this.businessRepository.manager.connection.createQueryRunner();
    await runner.connect();

    let locked = false;
    try {
      const rows: Array<{ locked: boolean }> = await runner.query(
        'SELECT pg_try_advisory_lock($1) AS locked',
        [BACKFILL_ADVISORY_LOCK],
      );
      locked = Boolean(rows[0]?.locked);
      if (!locked) {
        return {
          outcodes: 0,
          businessesUpdated: 0,
          skipped: 0,
          failed: 0,
          locked: false,
        };
      }

      const summary = await this.runBackfillBatch(batchSize);
      return { ...summary, locked: true };
    } finally {
      if (locked) {
        try {
          await runner.query('SELECT pg_advisory_unlock($1)', [
            BACKFILL_ADVISORY_LOCK,
          ]);
        } catch (error) {
          this.logger.warn(
            `Could not release geo backfill advisory lock: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
      await runner.release();
    }
  }

  private async runBackfillBatch(batchSize: number): Promise<{
    outcodes: number;
    businessesUpdated: number;
    skipped: number;
    failed: number;
  }> {
    const limit = Math.max(1, Math.min(batchSize, 100));
    const rows: Array<{ outcode: string; sample: string }> =
      await this.businessRepository.manager.query(
        `SELECT
           LEFT(clean.outcode_base, LENGTH(clean.outcode_base) - 3) AS outcode,
           MIN(clean.postcode) AS sample
         FROM (
           SELECT
             l.postcode AS postcode,
             UPPER(REGEXP_REPLACE(l.postcode, '\\s+', '', 'g')) AS outcode_base
           FROM "locations" l
           JOIN "businesses" b ON b.id = l."businessId"
           WHERE b."deleted_at" IS NULL
             AND b."status" = 'published'
             AND b."geoResolvedAt" IS NULL
             AND l.postcode IS NOT NULL
             AND l.postcode <> ''
             AND NOT EXISTS (
               SELECT 1 FROM "geo_postcode_resolutions" r
               WHERE r.outcode = LEFT(
                   UPPER(REGEXP_REPLACE(l.postcode, '\\s+', '', 'g')),
                   LENGTH(UPPER(REGEXP_REPLACE(l.postcode, '\\s+', '', 'g'))) - 3
                 )
                 AND r."resolved_at" > now() - interval '7 days'
                 AND r.city_name IS NULL
                 AND r.borough_name IS NULL
                 AND r.high_street_name IS NULL
                 AND r.local_mall_name IS NULL
             )
         ) clean
         WHERE LENGTH(clean.outcode_base) >= 5
         GROUP BY 1
         LIMIT $1`,
        [limit],
      );

    let businessesUpdated = 0;
    let skipped = 0;
    let failed = 0;

    // Two at a time is deliberate: Central performs a postcodes.io/OSM lookup
    // for uncached outcodes, and this worker must never compete with live
    // marketplace traffic.
    for (let index = 0; index < rows.length; index += 2) {
      const chunk = rows.slice(index, index + 2);
      const results = await Promise.allSettled(
        chunk.map((row) => this.backfillOutcode(row.outcode, row.sample)),
      );
      for (const result of results) {
        if (result.status === 'rejected') {
          failed += 1;
          this.logger.warn(
            `Geo backfill failed: ${
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason)
            }`,
          );
          continue;
        }
        if (result.value === null) skipped += 1;
        else businessesUpdated += result.value;
      }
    }

    if (businessesUpdated > 0 || failed > 0) {
      this.logger.log(
        `Geo backfill: ${businessesUpdated} businesses updated, ${skipped} outcodes skipped, ${failed} failed`,
      );
    }

    return {
      outcodes: rows.length,
      businessesUpdated,
      skipped,
      failed,
    };
  }

  private async backfillOutcode(
    outcode: string,
    samplePostcode: string,
  ): Promise<number | null> {
    const cached = await this.resolutionRepository.findOne({
      where: { outcode },
    });
    let resolution = cached;
    const cacheIsFresh =
      cached?.resolvedAt &&
      Date.now() - new Date(cached.resolvedAt).getTime() <
        OUTCODE_CACHE_TTL_MS;

    const cachedHasGeo = Boolean(
      cached?.cityName ||
        cached?.boroughName ||
        cached?.highStreetName ||
        cached?.localMallName,
    );

    // A fresh cache row with no geo names is a deliberate "invalid postcode"
    // marker. Skip the outcode without calling Central again.
    if (cacheIsFresh && !cachedHasGeo) return null;

    if (!cacheIsFresh) {
      const hierarchy = await this.central.getLocalMallOrResolvePostcode({
        postcode: samplePostcode,
      });
      if (!hierarchy) {
        // Negative-cache invalid/unresolvable postcodes so the always-on
        // worker does not hit Central for them every ten minutes.
        resolution = cached ?? this.resolutionRepository.create({ outcode });
        Object.assign(resolution, {
          postcode: samplePostcode,
          cityId: null,
          cityName: null,
          boroughId: null,
          boroughName: null,
          highStreetId: null,
          highStreetName: null,
          localMallId: null,
          localMallName: null,
          latitude: null,
          longitude: null,
          resolvedAt: new Date(),
        });
        await this.resolutionRepository.save(resolution);
        return null;
      }
      const patch = this.toPatch(hierarchy);

      // The public postcode resolver only suggests a mall name. When the mall
      // already has a local `local_malls` record for this outcode, prefer that
      // name so the picker matches what the business sees in its dashboard.
      const localMallName = await this.findLocalMallName(outcode);
      if (localMallName) {
        patch.geoLocalMallName = localMallName;
        patch.geoLocalMallId = null;
      }

      resolution = cached ?? this.resolutionRepository.create({ outcode });
      Object.assign(resolution, {
        postcode: samplePostcode,
        cityId: patch.geoCityId,
        cityName: patch.geoCityName,
        boroughId: patch.geoBoroughId,
        boroughName: patch.geoBoroughName,
        highStreetId: patch.geoHighStreetId,
        highStreetName: patch.geoHighStreetName,
        localMallId: patch.geoLocalMallId,
        localMallName: patch.geoLocalMallName,
        latitude: patch.geoLatitude,
        longitude: patch.geoLongitude,
        resolvedAt: new Date(),
      });
      resolution = await this.resolutionRepository.save(resolution);
    }

    if (!resolution) return null;

    const result: Array<{ count: string }> =
      await this.businessRepository.manager.query(
        `UPDATE "businesses" b
            SET "geoCityId" = $2,
                "geoCityName" = $3,
                "geoBoroughId" = $4,
                "geoBoroughName" = $5,
                "geoHighStreetId" = $6,
                "geoHighStreetName" = $7,
                "geoLocalMallId" = $8,
                "geoLocalMallName" = $9,
                "geoLatitude" = $10,
                "geoLongitude" = $11,
                "geoResolvedAt" = now()
           FROM "locations" l
          WHERE l."businessId" = b.id
            AND b."deleted_at" IS NULL
            AND b."geoResolvedAt" IS NULL
            AND LEFT(
                  UPPER(REGEXP_REPLACE(l.postcode, '\\s+', '', 'g')),
                  LENGTH(UPPER(REGEXP_REPLACE(l.postcode, '\\s+', '', 'g'))) - 3
                ) = $1
        RETURNING 1 AS count`,
        [
          outcode,
          resolution.cityId ?? null,
          resolution.cityName ?? null,
          resolution.boroughId ?? null,
          resolution.boroughName ?? null,
          resolution.highStreetId ?? null,
          resolution.highStreetName ?? null,
          resolution.localMallId ?? null,
          resolution.localMallName ?? null,
          resolution.latitude ?? null,
          resolution.longitude ?? null,
        ],
      );

    return result.length;
  }

  /**
   * First pass shortly after startup, so a fresh deployment starts filling
   * the hierarchy without waiting for the first interval.
   */
  @Timeout(BACKFILL_STARTUP_DELAY_MS)
  async initialBackfill(): Promise<void> {
    await this.runScheduledBackfill();
  }

  /**
   * Background backfill. Enabled by default; set `GEO_BACKFILL_ENABLED=false`
   * to disable it. Each run resolves at most `GEO_BACKFILL_BATCH` outward
   * codes (default 25), so Central traffic stays predictable.
   */
  @Interval(BACKFILL_INTERVAL_MS)
  async scheduledBackfill(): Promise<void> {
    await this.runScheduledBackfill();
  }

  private async runScheduledBackfill(): Promise<void> {
    if (process.env.GEO_BACKFILL_ENABLED === 'false') return;
    if (process.env.NODE_ENV === 'test') return;
    if (this.backfillRunning) return;

    this.backfillRunning = true;
    try {
      const configured = Number(
        process.env.GEO_BACKFILL_BATCH || DEFAULT_BACKFILL_BATCH,
      );
      const batch =
        Number.isFinite(configured) && configured > 0
          ? Math.min(Math.floor(configured), 100)
          : DEFAULT_BACKFILL_BATCH;

      const summary = await this.backfill(batch);
      if (!summary.locked) {
        this.logger.debug(
          'Geo backfill skipped: another API instance is running the worker.',
        );
        return;
      }
      if (summary.outcodes > 0) {
        this.logger.log(
          `Geo backfill run: ${summary.outcodes} outcodes, ` +
            `${summary.businessesUpdated} businesses updated, ` +
            `${summary.skipped} skipped, ${summary.failed} failed.`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Scheduled geo backfill failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      this.backfillRunning = false;
    }
  }

  private async findLocalMallName(
    outcode: string,
  ): Promise<string | null> {
    const rows: Array<{ name: string }> =
      await this.businessRepository.manager.query(
        `SELECT m.name, COUNT(*)::int AS count
           FROM "businesses" b
           JOIN "locations" l ON l."businessId" = b.id
           JOIN "local_malls" m ON m.id = b."localMallId"
          WHERE b."deleted_at" IS NULL
            AND b."status" = 'published'
            AND b."localMallId" IS NOT NULL
            AND LEFT(
                  UPPER(REGEXP_REPLACE(l.postcode, '\\s+', '', 'g')),
                  LENGTH(UPPER(REGEXP_REPLACE(l.postcode, '\\s+', '', 'g'))) - 3
                ) = $1
          GROUP BY m.name
          ORDER BY count DESC, m.name ASC
          LIMIT 1`,
        [outcode],
      );
    return rows[0]?.name || null;
  }

  private isFresh(business: Business): boolean {
    if (!business.geoResolvedAt) return false;
    const fresh =
      Date.now() - new Date(business.geoResolvedAt).getTime() <
      BUSINESS_REFRESH_MS;
    return (
      fresh &&
      Boolean(
        business.geoCityId ||
          business.geoBoroughId ||
          business.geoHighStreetId ||
          business.geoLocalMallId,
      )
    );
  }

  private toPatch(hierarchy: CentralHierarchy): BusinessGeoPatch {
    return hierarchyToBusinessGeoPatch(hierarchy);
  }
}

/**
 * Pure mapper shared by the SSO login path (which has no DI access to this
 * service because SsoModule owns McomCentralService) and the service above.
 */
export function hierarchyToBusinessGeoPatch(
  hierarchy: CentralHierarchy,
): BusinessGeoPatch {
  const highStreet = hierarchy.highStreet ?? null;
  const latitude = highStreet?.latitude ?? hierarchy.latitude ?? null;
  const longitude = highStreet?.longitude ?? hierarchy.longitude ?? null;

  return {
    geoCityId: hierarchy.city?.id || null,
    geoCityName: hierarchy.city?.name || null,
    geoBoroughId: hierarchy.borough?.id || null,
    geoBoroughName: hierarchy.borough?.name || null,
    geoHighStreetId: highStreet?.id || null,
    geoHighStreetName: highStreet?.name || null,
    geoLocalMallId: hierarchy.mall?.id || null,
    geoLocalMallName: hierarchy.mall?.name || null,
    geoLatitude: latitude,
    geoLongitude: longitude,
    geoResolvedAt: new Date(),
  };
}
