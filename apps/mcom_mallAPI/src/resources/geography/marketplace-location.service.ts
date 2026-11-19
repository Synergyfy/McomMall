import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { McomCentralService } from '../sso/mcom-central.service';
import { GeoPostcodeResolution } from './entities/geo-postcode-resolution.entity';
import {
  CentralHierarchy,
} from './business-geography.service';
import { LocationLevel } from './dto/location-filter.dto';

export interface LocationFacetNode {
  id: string;
  name: string;
  count: number;
  latitude: number | null;
  longitude: number | null;
  children: LocationFacetNode[];
}

export interface MarketplaceLocationFacets {
  cities: LocationFacetNode[];
  /**
   * Fallback list derived from the legacy `locations.city` / `resolvedArea`
   * fields. Populated for businesses that have not yet been assigned the
   * Central hierarchy, so postcode-era data remains searchable during rollout.
   */
  areas: LocationFacetNode[];
  totalBusinesses: number;
  updatedAt: string;
}

export interface MarketplaceLocationSearchResult {
  level: LocationLevel;
  id: string;
  name: string;
  count: number;
  path: string[];
}

export interface MarketplaceLocationSearchResponse {
  results: MarketplaceLocationSearchResult[];
}

export interface ResolvedHierarchyNode {
  id: string;
  name: string;
}

export interface ResolvedMarketplaceLocation {
  scope: {
    type: LocationLevel;
    id: string;
    name: string;
  } | null;
  hierarchy: {
    city: ResolvedHierarchyNode | null;
    borough: ResolvedHierarchyNode | null;
    highStreet: ResolvedHierarchyNode | null;
    localMall: ResolvedHierarchyNode | null;
  };
  /** Profile assignment, postcode, browser coordinates or nearest-city fallback. */
  source: 'profile' | 'postcode' | 'geolocation' | 'nearest' | 'none';
  country: string | null;
}

interface FacetRow {
  city_id: string | null;
  city_name: string | null;
  borough_id: string | null;
  borough_name: string | null;
  high_street_id: string | null;
  high_street_name: string | null;
  mall_id: string | null;
  mall_name: string | null;
  count: number;
  latitude: number | null;
  longitude: number | null;
}

const FACETS_TTL_MS = 5 * 60 * 1000;
const LOCATION_TTL_MS = 30 * 60 * 1000;
const USER_LOCATION_TTL_MS = 30 * 60 * 1000;
const UK_COUNTRIES = new Set([
  'england',
  'scotland',
  'wales',
  'northern ireland',
  'united kingdom',
  'great britain',
]);

function normalise(value?: string | null): string {
  return (value || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

function outcodeOf(postcode?: string | null): string | null {
  const clean = (postcode || '').toUpperCase().replace(/\s+/g, '');
  return clean.length >= 5 ? clean.slice(0, clean.length - 3) : null;
}

function formatPostcode(compact: string): string {
  return compact.length > 3
    ? `${compact.slice(0, compact.length - 3)} ${compact.slice(-3)}`
    : compact;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function nodeKey(id?: string | null, name?: string | null): string | null {
  if (id) return id;
  if (name) return `name:${slug(name)}`;
  return null;
}

function toNode(
  id: string | null | undefined,
  name: string | null | undefined,
): ResolvedHierarchyNode | null {
  if (!id && !name) return null;
  return {
    id: id || `name:${slug(name || '')}`,
    name: name || id || '',
  };
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Owns marketplace geography at request time.
 *
 * Facets are aggregated from the denormalised `businesses.geo*` columns with a
 * single grouped query and cached in-process for five minutes. Resolving a
 * shopper uses at most one Central call per user (or per postcode/coordinate),
 * and falls back to the local outcode cache when Central is unavailable.
 */
@Injectable()
export class MarketplaceLocationService {
  private readonly logger = new Logger(MarketplaceLocationService.name);
  private readonly cache = new Map<
    string,
    { expiresAt: number; value: unknown }
  >();

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(GeoPostcodeResolution)
    private readonly resolutionRepository: Repository<GeoPostcodeResolution>,
    private readonly central: McomCentralService,
  ) {}

  async getFacets(): Promise<MarketplaceLocationFacets> {
    const cached = this.read<MarketplaceLocationFacets>('facets');
    if (cached) return cached;

    const rows: FacetRow[] =
      await this.businessRepository.manager.query(
        `SELECT
           b."geoCityId"        AS city_id,
           b."geoCityName"      AS city_name,
           b."geoBoroughId"     AS borough_id,
           b."geoBoroughName"   AS borough_name,
           b."geoHighStreetId"  AS high_street_id,
           b."geoHighStreetName" AS high_street_name,
           b."geoLocalMallId"   AS mall_id,
           b."geoLocalMallName" AS mall_name,
           COUNT(*)::int        AS count,
           AVG(b."geoLatitude")  AS latitude,
           AVG(b."geoLongitude") AS longitude
         FROM "businesses" b
         WHERE b."deleted_at" IS NULL
           AND b."status" = 'published'
           AND (b."geoCityId" IS NOT NULL OR b."geoCityName" IS NOT NULL)
         GROUP BY 1, 2, 3, 4, 5, 6, 7, 8`,
      );

    const cities = new Map<string, LocationFacetNode>();
    const boroughs = new Map<string, LocationFacetNode>();
    const highStreets = new Map<string, LocationFacetNode>();
    const malls = new Map<string, LocationFacetNode>();
    let totalBusinesses = 0;

    for (const row of rows) {
      const count = Number(row.count) || 0;
      const cityKey = nodeKey(row.city_id, row.city_name);
      if (!cityKey) continue;
      totalBusinesses += count;

      const city = this.upsertNode(
        cities,
        cityKey,
        row.city_id || cityKey,
        row.city_name || row.city_id || '',
        row.latitude,
        row.longitude,
        count,
      );

      const boroughKey = nodeKey(row.borough_id, row.borough_name);
      if (!boroughKey) continue;
      const boroughMapKey = `${cityKey}|${boroughKey}`;
      const boroughIsNew = !boroughs.has(boroughMapKey);
      const borough = this.upsertNode(
        boroughs,
        boroughMapKey,
        row.borough_id || boroughKey,
        row.borough_name || row.borough_id || '',
        row.latitude,
        row.longitude,
        count,
      );
      if (boroughIsNew) city.children.push(borough);

      const highStreetKey = nodeKey(
        row.high_street_id,
        row.high_street_name,
      );
      if (!highStreetKey) continue;
      const highStreetMapKey = `${cityKey}|${boroughKey}|${highStreetKey}`;
      const highStreetIsNew = !highStreets.has(highStreetMapKey);
      const highStreet = this.upsertNode(
        highStreets,
        highStreetMapKey,
        row.high_street_id || highStreetKey,
        row.high_street_name || row.high_street_id || '',
        row.latitude,
        row.longitude,
        count,
      );
      if (highStreetIsNew) borough.children.push(highStreet);

      const mallKey = nodeKey(row.mall_id, row.mall_name);
      if (!mallKey) continue;
      const mallMapKey = `${cityKey}|${boroughKey}|${highStreetKey}|${mallKey}`;
      const mallIsNew = !malls.has(mallMapKey);
      const mall = this.upsertNode(
        malls,
        mallMapKey,
        row.mall_id || mallKey,
        row.mall_name || row.mall_id || '',
        row.latitude,
        row.longitude,
        count,
      );
      if (mallIsNew) highStreet.children.push(mall);
    }

    const sortTree = (
      nodes: Iterable<LocationFacetNode>,
    ): LocationFacetNode[] =>
      [...nodes]
        .map((node) => ({
          ...node,
          children: sortTree(node.children),
        }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    // Legacy fallback. Until the Central backfill runs, `locations.city`
    // (which stores the postcode's admin district) is the only reliable place
    // name we have. Exposing it as "area" means Westminster, for example, is
    // searchable and selectable immediately after deploying.
    const areaRows: Array<{
      name: string;
      count: number;
      latitude: number | null;
      longitude: number | null;
    }> = await this.businessRepository.manager.query(
      `SELECT
         COALESCE(NULLIF(l.city, ''), NULLIF(l."resolvedArea", '')) AS name,
         COUNT(*)::int AS count,
         AVG(l.latitude) AS latitude,
         AVG(l.longitude) AS longitude
       FROM "businesses" b
       JOIN "locations" l ON l."businessId" = b.id
       WHERE b."deleted_at" IS NULL
         AND b."status" = 'published'
         AND (b."geoCityId" IS NULL AND b."geoCityName" IS NULL)
         AND COALESCE(NULLIF(l.city, ''), NULLIF(l."resolvedArea", '')) IS NOT NULL
       GROUP BY 1
       ORDER BY count DESC, name ASC`,
    );

    const areas: LocationFacetNode[] = areaRows.map((row) => ({
      id: `name:${slug(row.name)}`,
      name: row.name,
      count: Number(row.count) || 0,
      latitude: row.latitude == null ? null : Number(row.latitude),
      longitude: row.longitude == null ? null : Number(row.longitude),
      children: [],
    }));

    totalBusinesses += areas.reduce((sum, area) => sum + area.count, 0);

    const facets: MarketplaceLocationFacets = {
      cities: sortTree(cities.values()),
      areas,
      totalBusinesses,
      updatedAt: new Date().toISOString(),
    };
    this.write('facets', facets, FACETS_TTL_MS);
    return facets;
  }

  /**
   * Postcode + text search for the location picker.
   *
   * A postcode is resolved through Central when possible and also always
   * returns an outward-code result backed by the local `locations` table. That
   * makes searches like `SW1A 1AA` useful even before the hierarchy backfill
   * has run. Text search looks at both the Central hierarchy columns and the
   * legacy `locations.city` / `resolvedArea` fields.
   */
  async search(query: string): Promise<MarketplaceLocationSearchResponse> {
    const q = (query || '').trim();
    if (q.length < 2) return { results: [] };

    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = this.read<MarketplaceLocationSearchResponse>(cacheKey);
    if (cached) return cached;

    const compact = q.toUpperCase().replace(/\s+/g, '');
    // UK full postcode: SW1A1AA. Outward code only: SW1A.
    const isFullPostcode = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact);
    const isOutcode = /^[A-Z]{1,2}\d[A-Z\d]?$/.test(compact);
    const results: MarketplaceLocationSearchResult[] = [];

    if (isFullPostcode || isOutcode) {
      const outcode = isFullPostcode
        ? compact.slice(0, compact.length - 3)
        : compact;
      const display = isFullPostcode ? formatPostcode(compact) : outcode;
      const count = await this.countPostcode(outcode);

      results.push({
        level: 'postcode',
        id: outcode,
        name: display,
        count,
        path: [display],
      });

      if (isFullPostcode) {
        const hierarchy = await this.central.getLocalMallOrResolvePostcode({
          postcode: display,
        });
        if (hierarchy) {
          const nodes: Array<
            [
              LocationLevel,
              string | null | undefined,
              string | null | undefined,
            ]
          > = [
            ['city', hierarchy.city?.id, hierarchy.city?.name],
            ['borough', hierarchy.borough?.id, hierarchy.borough?.name],
            [
              'high-street',
              hierarchy.highStreet?.id,
              hierarchy.highStreet?.name,
            ],
            ['local-mall', hierarchy.mall?.id, hierarchy.mall?.name],
          ];

          const exactCounts = await Promise.all(
            nodes.map(([level, id, name]) =>
              name ? this.countHierarchy(level, id || null, name) : 0,
            ),
          );

          nodes.forEach(([level, id, name], index) => {
            if (!name) return;
            const nodeCount = exactCounts[index];
            if (nodeCount <= 0) return;
            results.push({
              level,
              id: id || `name:${slug(name)}`,
              name,
              count: nodeCount,
              path: [name],
            });
          });
        }

        // Central's fallback resolver can suggest a different mall name from
        // the one the local business is already assigned to. Prefer the local
        // mall names that actually contain businesses in this outcode.
        const localMalls = await this.findOutcodeLocalMalls(outcode);
        for (const mall of localMalls) {
          results.push({
            level: 'local-mall',
            id: `name:${slug(mall.name)}`,
            name: mall.name,
            count: mall.count,
            path: [mall.name],
          });
        }
      }

      const response = {
        results: this.dedupeSearch(results).slice(0, 20),
      };
      this.write(cacheKey, response, 60_000);
      return response;
    }

    const like = `%${q}%`;
    const [areas, hierarchyResults] = await Promise.all([
      this.searchAreas(like),
      this.searchHierarchy(like),
    ]);

    const response = {
      results: this.dedupeSearch([
        ...hierarchyResults,
        ...areas,
      ]).slice(0, 20),
    };
    this.write(cacheKey, response, 60_000);
    return response;
  }

  private async countPostcode(outcode: string): Promise<number> {
    const rows: Array<{ count: string }> =
      await this.businessRepository.manager.query(
        `SELECT COUNT(*)::int AS count
           FROM "businesses" b
           JOIN "locations" l ON l."businessId" = b.id
          WHERE b."deleted_at" IS NULL
            AND b."status" = 'published'
            AND REPLACE(UPPER(l.postcode), ' ', '') LIKE $1`,
        [`${outcode}%`],
      );
    return Number(rows[0]?.count) || 0;
  }

  private async countHierarchy(
    level: LocationLevel,
    id: string | null,
    name: string,
  ): Promise<number> {
    let condition: string;
    switch (level) {
      case 'city':
        condition = `(b."geoCityId" = $1 OR LOWER(b."geoCityName") = LOWER($2)
          OR LOWER(l.city) = LOWER($2) OR LOWER(l."resolvedArea") = LOWER($2))`;
        break;
      case 'borough':
        condition = `(b."geoBoroughId" = $1 OR LOWER(b."geoBoroughName") = LOWER($2)
          OR LOWER(l.city) = LOWER($2) OR LOWER(l."resolvedArea") = LOWER($2))`;
        break;
      case 'high-street':
        condition = `(b."geoHighStreetId" = $1 OR LOWER(b."geoHighStreetName") = LOWER($2))`;
        break;
      case 'local-mall':
        condition = `(b."geoLocalMallId" = $1 OR LOWER(b."geoLocalMallName") = LOWER($2)
          OR EXISTS (
            SELECT 1 FROM "local_malls" m
            WHERE m.id = b."localMallId" AND LOWER(m.name) = LOWER($2)
          ))`;
        break;
      default:
        return 0;
    }

    const rows: Array<{ count: string }> =
      await this.businessRepository.manager.query(
        `SELECT COUNT(*)::int AS count
           FROM "businesses" b
           LEFT JOIN "locations" l ON l."businessId" = b.id
          WHERE b."deleted_at" IS NULL
            AND b."status" = 'published'
            AND ${condition}`,
        [id, name],
      );
    return Number(rows[0]?.count) || 0;
  }

  private async findOutcodeLocalMalls(
    outcode: string,
  ): Promise<Array<{ name: string; count: number }>> {
    const rows: Array<{ name: string; count: string }> =
      await this.businessRepository.manager.query(
        `SELECT
           COALESCE(NULLIF(b."geoLocalMallName", ''), NULLIF(m.name, '')) AS name,
           COUNT(*)::int AS count
         FROM "businesses" b
         JOIN "locations" l ON l."businessId" = b.id
         LEFT JOIN "local_malls" m ON m.id = b."localMallId"
         WHERE b."deleted_at" IS NULL
           AND b."status" = 'published'
           AND REPLACE(UPPER(l.postcode), ' ', '') LIKE $1
           AND COALESCE(NULLIF(b."geoLocalMallName", ''), NULLIF(m.name, '')) IS NOT NULL
         GROUP BY 1
         ORDER BY count DESC, name ASC
         LIMIT 5`,
        [`${outcode}%`],
      );
    return rows.map((row) => ({
      name: row.name,
      count: Number(row.count) || 0,
    }));
  }

  private async searchAreas(
    like: string,
  ): Promise<MarketplaceLocationSearchResult[]> {
    const rows: Array<{ name: string; count: string }> =
      await this.businessRepository.manager.query(
        `SELECT
           COALESCE(NULLIF(l.city, ''), NULLIF(l."resolvedArea", '')) AS name,
           COUNT(*)::int AS count
         FROM "businesses" b
         JOIN "locations" l ON l."businessId" = b.id
         WHERE b."deleted_at" IS NULL
           AND b."status" = 'published'
           AND (b."geoCityId" IS NULL AND b."geoCityName" IS NULL)
           AND COALESCE(NULLIF(l.city, ''), NULLIF(l."resolvedArea", '')) ILIKE $1
         GROUP BY 1
         ORDER BY count DESC, name ASC
         LIMIT 10`,
        [like],
      );

    return rows.map((row) => ({
      level: 'area' as LocationLevel,
      id: `name:${slug(row.name)}`,
      name: row.name,
      count: Number(row.count) || 0,
      path: [row.name],
    }));
  }

  private async searchHierarchy(
    like: string,
  ): Promise<MarketplaceLocationSearchResult[]> {
    const rows: Array<{
      level: LocationLevel;
      id: string | null;
      name: string;
      count: string;
    }> = await this.businessRepository.manager.query(
      `SELECT 'city' AS level, b."geoCityId" AS id, b."geoCityName" AS name, COUNT(*)::int AS count
         FROM "businesses" b
        WHERE b."deleted_at" IS NULL AND b."status" = 'published'
          AND b."geoCityName" ILIKE $1
        GROUP BY 1, 2, 3
       UNION ALL
       SELECT 'borough', b."geoBoroughId", b."geoBoroughName", COUNT(*)::int
         FROM "businesses" b
        WHERE b."deleted_at" IS NULL AND b."status" = 'published'
          AND b."geoBoroughName" ILIKE $1
        GROUP BY 1, 2, 3
       UNION ALL
       SELECT 'high-street', b."geoHighStreetId", b."geoHighStreetName", COUNT(*)::int
         FROM "businesses" b
        WHERE b."deleted_at" IS NULL AND b."status" = 'published'
          AND b."geoHighStreetName" ILIKE $1
        GROUP BY 1, 2, 3
       UNION ALL
       SELECT 'local-mall', b."geoLocalMallId", b."geoLocalMallName", COUNT(*)::int
         FROM "businesses" b
        WHERE b."deleted_at" IS NULL AND b."status" = 'published'
          AND b."geoLocalMallName" ILIKE $1
        GROUP BY 1, 2, 3
       ORDER BY count DESC, name ASC
       LIMIT 12`,
      [like],
    );

    return rows
      .filter((row) => Boolean(row.name))
      .map((row) => ({
        level: row.level,
        id: row.id || `name:${slug(row.name)}`,
        name: row.name,
        count: Number(row.count) || 0,
        path: [row.name],
      }));
  }

  private dedupeSearch(
    results: MarketplaceLocationSearchResult[],
  ): MarketplaceLocationSearchResult[] {
    const seen = new Map<string, MarketplaceLocationSearchResult>();
    for (const result of results) {
      const key = `${result.level}:${result.id}`;
      if (!seen.has(key)) seen.set(key, result);
    }
    return [...seen.values()];
  }

  /**
   * Resolves the shopper's location. Prefers their Central assignment, then a
   * supplied/saved postcode, then browser coordinates. Non-UK coordinates fall
   * back to the closest UK city that actually has businesses.
   */
  async resolve(params: {
    user?: User | null;
    postcode?: string | null;
    lat?: number | null;
    lng?: number | null;
  }): Promise<ResolvedMarketplaceLocation> {
    const { user } = params;

    // Explicit input from "My location" or a postcode must beat the profile:
    // the shopper is deliberately asking for their current position.
    if (params.postcode) {
      const resolved = await this.resolvePostcode(params.postcode, 'postcode');
      if (resolved) return resolved;
    }

    if (
      typeof params.lat === 'number' &&
      typeof params.lng === 'number' &&
      Number.isFinite(params.lat) &&
      Number.isFinite(params.lng)
    ) {
      const key = `geo:${params.lat.toFixed(3)},${params.lng.toFixed(3)}`;
      const cached = this.read<ResolvedMarketplaceLocation>(key);
      if (cached) return cached;

      // Cheap bounding-box check first: shoppers outside the UK skip the
      // reverse-geocode call and go straight to the closest-city fallback.
      const insideUk =
        params.lat >= 49.8 &&
        params.lat <= 60.9 &&
        params.lng >= -8.6 &&
        params.lng <= 1.8;

      const reverse = insideUk
        ? await this.reverseGeocode(params.lat, params.lng)
        : { postcode: null, isUk: false };
      if (reverse?.postcode && reverse.isUk) {
        const resolved = await this.resolvePostcode(
          reverse.postcode,
          'geolocation',
        );
        if (resolved) {
          this.write(key, resolved, LOCATION_TTL_MS);
          return resolved;
        }
      }

      const nearest = await this.findNearest(params.lat, params.lng);
      if (nearest) {
        this.write(key, nearest, LOCATION_TTL_MS);
        return nearest;
      }
    }

    if (user?.centralUserId) {
      const key = `user:${user.centralUserId}`;
      const cached = this.read<ResolvedMarketplaceLocation>(key);
      if (cached) return cached;
      const hierarchy = await this.central.getLocalMall({
        userId: user.centralUserId,
      });
      const resolved = hierarchy
        ? this.fromCentral(hierarchy, 'profile')
        : null;
      if (resolved) {
        this.write(key, resolved, USER_LOCATION_TTL_MS);
        return resolved;
      }
    }

    const profilePostcode =
      user?.postcode ||
      ((user?.centralProfile as Record<string, unknown> | null)?.postcode as
        | string
        | undefined) ||
      null;

    if (profilePostcode) {
      const resolved = await this.resolvePostcode(
        profilePostcode,
        user?.centralUserId ? 'profile' : 'postcode',
      );
      if (resolved) return resolved;
    }

    return this.empty();
  }

  private async resolvePostcode(
    postcode: string,
    source: 'profile' | 'postcode' | 'geolocation',
  ): Promise<ResolvedMarketplaceLocation | null> {
    const normalized = normalise(postcode);
    if (!normalized) return null;

    const key = `postcode:${normalized}`;
    const cached = this.read<ResolvedMarketplaceLocation>(key);
    if (cached) return cached;

    const hierarchy = await this.central.getLocalMallOrResolvePostcode({
      postcode: normalized,
    });
    if (hierarchy) {
      const resolved = this.fromCentral(hierarchy, source);
      this.write(key, resolved, LOCATION_TTL_MS);
      return resolved;
    }

    // Central unavailable: use the backfill cache for the outcode.
    const outcode = outcodeOf(postcode);
    if (!outcode) return null;
    const cachedResolution = await this.resolutionRepository.findOne({
      where: { outcode },
    });
    if (!cachedResolution) return null;

    const resolved = this.fromCentral(
      {
        city: {
          id: cachedResolution.cityId,
          name: cachedResolution.cityName,
        },
        borough: {
          id: cachedResolution.boroughId,
          name: cachedResolution.boroughName,
        },
        highStreet: {
          id: cachedResolution.highStreetId,
          name: cachedResolution.highStreetName,
          latitude: cachedResolution.latitude,
          longitude: cachedResolution.longitude,
        },
        mall: {
          id: cachedResolution.localMallId,
          name: cachedResolution.localMallName,
        },
        latitude: cachedResolution.latitude,
        longitude: cachedResolution.longitude,
      },
      source,
    );
    this.write(key, resolved, LOCATION_TTL_MS);
    return resolved;
  }

  private fromCentral(
    hierarchy: CentralHierarchy,
    source: ResolvedMarketplaceLocation['source'],
  ): ResolvedMarketplaceLocation {
    const city = toNode(hierarchy.city?.id, hierarchy.city?.name);
    const borough = toNode(hierarchy.borough?.id, hierarchy.borough?.name);
    const highStreet = toNode(
      hierarchy.highStreet?.id,
      hierarchy.highStreet?.name,
    );
    const localMall = toNode(hierarchy.mall?.id, hierarchy.mall?.name);

    // Broadest available node is the default scope. The frontend also sends
    // the near* ids so city-wide results are ordered local → city.
    const scopeNode = city
      ? { type: 'city' as const, node: city }
      : borough
        ? { type: 'borough' as const, node: borough }
        : highStreet
          ? { type: 'high-street' as const, node: highStreet }
          : localMall
            ? { type: 'local-mall' as const, node: localMall }
            : null;

    return {
      scope: scopeNode
        ? {
            type: scopeNode.type,
            id: scopeNode.node.id,
            name: scopeNode.node.name,
          }
        : null,
      hierarchy: { city, borough, highStreet, localMall },
      source,
      country: 'GB',
    };
  }

  private async findNearest(
    lat: number,
    lng: number,
  ): Promise<ResolvedMarketplaceLocation | null> {
    const facets = await this.getFacets();
    let best:
      | {
          distance: number;
          city: LocationFacetNode;
          borough: LocationFacetNode | null;
          highStreet: LocationFacetNode | null;
          mall: LocationFacetNode | null;
        }
      | null = null;

    const consider = (
      city: LocationFacetNode,
      borough: LocationFacetNode | null,
      highStreet: LocationFacetNode | null,
      mall: LocationFacetNode | null,
    ) => {
      const node = mall || highStreet || borough || city;
      if (node.latitude == null || node.longitude == null) return;
      const distance = haversineKm(
        lat,
        lng,
        Number(node.latitude),
        Number(node.longitude),
      );
      if (!best || distance < best.distance) {
        best = { distance, city, borough, highStreet, mall };
      }
    };

    for (const city of facets.cities) {
      consider(city, null, null, null);
      for (const borough of city.children) {
        consider(city, borough, null, null);
        for (const highStreet of borough.children) {
          consider(city, borough, highStreet, null);
          for (const mall of highStreet.children) {
            consider(city, borough, highStreet, mall);
          }
        }
      }
    }

    if (!best) return null;
    const match = best as {
      city: LocationFacetNode;
      borough: LocationFacetNode | null;
      highStreet: LocationFacetNode | null;
      mall: LocationFacetNode | null;
    };

    return {
      scope: { type: 'city', id: match.city.id, name: match.city.name },
      hierarchy: {
        city: { id: match.city.id, name: match.city.name },
        borough: match.borough
          ? { id: match.borough.id, name: match.borough.name }
          : null,
        highStreet: match.highStreet
          ? { id: match.highStreet.id, name: match.highStreet.name }
          : null,
        localMall: match.mall
          ? { id: match.mall.id, name: match.mall.name }
          : null,
      },
      source: 'nearest',
      country: null,
    };
  }

  private async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<{ postcode: string | null; isUk: boolean } | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(
        `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=1`,
        { signal: controller.signal },
      );
      if (!response.ok) return null;
      const body = (await response.json()) as {
        result?: Array<{ postcode?: string; country?: string }> | null;
      };
      const first = body.result?.[0];
      if (!first) return { postcode: null, isUk: false };
      return {
        postcode: first.postcode || null,
        isUk: UK_COUNTRIES.has(
          (first.country || '').toLowerCase().trim(),
        ),
      };
    } catch (error) {
      this.logger.debug(
        `Reverse geocode failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private upsertNode(
    map: Map<string, LocationFacetNode>,
    key: string,
    id: string,
    name: string,
    latitude: number | null,
    longitude: number | null,
    count: number,
  ): LocationFacetNode {
    let node = map.get(key);
    if (!node) {
      node = {
        id,
        name,
        count: 0,
        latitude: null,
        longitude: null,
        children: [],
      };
      map.set(key, node);
    }

    node.count += count;
    if (latitude != null && longitude != null) {
      const previous = node.count - count;
      if (node.latitude == null || node.longitude == null) {
        node.latitude = Number(latitude);
        node.longitude = Number(longitude);
      } else {
        node.latitude =
          (node.latitude * previous + Number(latitude) * count) /
          (previous + count || 1);
        node.longitude =
          (node.longitude * previous + Number(longitude) * count) /
          (previous + count || 1);
      }
    }
    return node;
  }

  private empty(): ResolvedMarketplaceLocation {
    return {
      scope: null,
      hierarchy: {
        city: null,
        borough: null,
        highStreet: null,
        localMall: null,
      },
      source: 'none',
      country: null,
    };
  }

  private read<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  private write(key: string, value: unknown, ttlMs: number): void {
    if (this.cache.size > 5000) {
      const now = Date.now();
      for (const [cachedKey, entry] of this.cache) {
        if (entry.expiresAt <= now) this.cache.delete(cachedKey);
      }
    }
    this.cache.set(key, { expiresAt: Date.now() + ttlMs, value });
  }
}
