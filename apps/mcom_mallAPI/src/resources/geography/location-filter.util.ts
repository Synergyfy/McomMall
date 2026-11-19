import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { BusinessStatus } from '../listings/listing.enum';
import {
  LocationFilterDto,
  LocationLevel,
} from './dto/location-filter.dto';

/** A resolved geographic node a shopper has selected or been assigned to. */
export interface LocationScope {
  type: LocationLevel;
  id: string;
  name: string;
}

type HierarchyLevel = Exclude<LocationLevel, 'area' | 'postcode'>;

const LEVEL_COLUMNS: Record<HierarchyLevel, { id: string; name: string }> = {
  city: { id: 'geoCityId', name: 'geoCityName' },
  borough: { id: 'geoBoroughId', name: 'geoBoroughName' },
  'high-street': { id: 'geoHighStreetId', name: 'geoHighStreetName' },
  'local-mall': { id: 'geoLocalMallId', name: 'geoLocalMallName' },
};

const LEVEL_DB_COLUMNS: Record<HierarchyLevel, { id: string; name: string }> = {
  city: { id: 'geoCityId', name: 'geoCityName' },
  borough: { id: 'geoBoroughId', name: 'geoBoroughName' },
  'high-street': { id: 'geoHighStreetId', name: 'geoHighStreetName' },
  'local-mall': { id: 'geoLocalMallId', name: 'geoLocalMallName' },
};

export function hasLocationFilter(
  filter?: LocationFilterDto | null,
): filter is LocationFilterDto {
  return Boolean(
    filter?.locationType && (filter.locationId || filter.locationName),
  );
}

export function toLocationScope(
  filter?: LocationFilterDto | null,
): LocationScope | null {
  if (!hasLocationFilter(filter)) return null;
  return {
    type: filter.locationType as LocationLevel,
    id: filter.locationId || `name:${filter.locationName}`,
    name: filter.locationName || filter.locationId || '',
  };
}

/**
 * Applies a location subtree filter to a query that already joins the
 * `businesses` table. Matches on the Central id when present and falls back
 * to the denormalised name for older rows.
 */
export function normalizePostcode(value?: string | null): string {
  return (value || '').toUpperCase().replace(/\s+/g, '');
}

export function applyBusinessLocationFilter<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  businessAlias: string,
  filter?: LocationFilterDto | null,
  paramPrefix = 'loc',
  locationAlias = 'businessLocation',
): void {
  if (!hasLocationFilter(filter)) return;

  if (filter.locationType === 'area') {
    const areaName = (filter.locationName || filter.locationId || '')
      .trim()
      .toLowerCase();
    if (!areaName) return;
    query.andWhere(
      `(LOWER(${locationAlias}.city) = :${paramPrefix}Area
        OR LOWER(${locationAlias}.resolvedArea) = :${paramPrefix}Area
        OR LOWER(${businessAlias}.geoCityName) = :${paramPrefix}Area
        OR LOWER(${businessAlias}.geoBoroughName) = :${paramPrefix}Area
        OR LOWER(${businessAlias}.geoHighStreetName) = :${paramPrefix}Area
        OR LOWER(${businessAlias}.geoLocalMallName) = :${paramPrefix}Area)`,
      { [`${paramPrefix}Area`]: areaName },
    );
    return;
  }

  if (filter.locationType === 'postcode') {
    const postcode = normalizePostcode(
      filter.locationId || filter.locationName,
    );
    if (!postcode) return;
    query.andWhere(
      `REPLACE(UPPER(${locationAlias}.postcode), ' ', '') LIKE :${paramPrefix}Postcode`,
      { [`${paramPrefix}Postcode`]: `${postcode}%` },
    );
    return;
  }

  const columns = LEVEL_COLUMNS[filter.locationType as HierarchyLevel];
  const params: Record<string, string> = {};
  const conditions: string[] = [];

  if (filter.locationId) {
    params[`${paramPrefix}Id`] = filter.locationId;
    conditions.push(`${businessAlias}.${columns.id} = :${paramPrefix}Id`);
  }
  if (filter.locationName) {
    params[`${paramPrefix}Name`] = filter.locationName.toLowerCase();
    conditions.push(
      `LOWER(${businessAlias}.${columns.name}) = :${paramPrefix}Name`,
    );
  }

  if (conditions.length) {
    query.andWhere(`(${conditions.join(' OR ')})`, params);
  }
}

/**
 * Applies the same filter to a listing owned by a user rather than directly by
 * a business (vouchers, gift cards, coupon products). Uses EXISTS so a seller
 * with several businesses cannot multiply the result set or the count.
 */
export function applySellerLocationFilter<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  sellerAlias: string,
  sellerUserColumn: string,
  filter?: LocationFilterDto | null,
  paramPrefix = 'sellerLoc',
): void {
  if (!hasLocationFilter(filter)) return;

  const params: Record<string, string> = {
    [`${paramPrefix}Status`]: BusinessStatus.PUBLISHED,
  };
  const conditions: string[] = [];

  if (filter.locationType === 'area') {
    const areaName = (filter.locationName || filter.locationId || '')
      .trim()
      .toLowerCase();
    if (!areaName) return;
    params[`${paramPrefix}Area`] = areaName;
    conditions.push(
      `LOWER(seller_location.city) = :${paramPrefix}Area`,
      `LOWER(seller_location."resolvedArea") = :${paramPrefix}Area`,
      `LOWER(geo."geoCityName") = :${paramPrefix}Area`,
      `LOWER(geo."geoBoroughName") = :${paramPrefix}Area`,
      `LOWER(geo."geoHighStreetName") = :${paramPrefix}Area`,
      `LOWER(geo."geoLocalMallName") = :${paramPrefix}Area`,
    );
  } else if (filter.locationType === 'postcode') {
    const postcode = normalizePostcode(
      filter.locationId || filter.locationName,
    );
    if (!postcode) return;
    params[`${paramPrefix}Postcode`] = `${postcode}%`;
    conditions.push(
      `REPLACE(UPPER(seller_location.postcode), ' ', '') LIKE :${paramPrefix}Postcode`,
    );
  } else {
    const columns = LEVEL_DB_COLUMNS[filter.locationType as HierarchyLevel];
    if (filter.locationId) {
      params[`${paramPrefix}Id`] = filter.locationId;
      conditions.push(`geo."${columns.id}" = :${paramPrefix}Id`);
    }
    if (filter.locationName) {
      params[`${paramPrefix}Name`] = filter.locationName.toLowerCase();
      conditions.push(`LOWER(geo."${columns.name}") = :${paramPrefix}Name`);
    }
  }

  if (!conditions.length) return;

  query.andWhere(
    `EXISTS (
      SELECT 1 FROM "businesses" geo
      LEFT JOIN "locations" seller_location
        ON seller_location."businessId" = geo.id
      WHERE geo."userId" = "${sellerAlias}"."${sellerUserColumn}"
        AND geo."status" = :${paramPrefix}Status
        AND geo."deleted_at" IS NULL
        AND (${conditions.join(' OR ')})
    )`,
    params,
  );
}

function nearCaseSql(
  alias: string,
  filter: LocationFilterDto,
  prefix: string,
): { cases: string[]; params: Record<string, string> } {
  const cases: string[] = [];
  const params: Record<string, string> = {};
  const quotedAlias = `"${alias}"`;

  if (filter.nearLocalMallId) {
    params[`${prefix}NearMallId`] = filter.nearLocalMallId;
    cases.push(
      `WHEN ${quotedAlias}."geoLocalMallId" = :${prefix}NearMallId THEN 0`,
    );
  }
  if (filter.nearHighStreetId) {
    params[`${prefix}NearHighStreetId`] = filter.nearHighStreetId;
    cases.push(
      `WHEN ${quotedAlias}."geoHighStreetId" = :${prefix}NearHighStreetId THEN 1`,
    );
  }
  if (filter.nearBoroughId) {
    params[`${prefix}NearBoroughId`] = filter.nearBoroughId;
    cases.push(
      `WHEN ${quotedAlias}."geoBoroughId" = :${prefix}NearBoroughId THEN 2`,
    );
  }

  return { cases, params };
}

/**
 * Orders a business-owned listing local-mall → high-street → borough → city.
 * Only applied when the shopper's own hierarchy is supplied, so users who
 * explicitly pick a different location keep a simple newest-first order.
 */
export function applyBusinessNearOrder<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  businessAlias: string,
  filter?: LocationFilterDto | null,
): void {
  if (!filter) return;
  const { cases, params } = nearCaseSql(businessAlias, filter, 'order');
  if (!cases.length) return;
  query.setParameters(params);
  query.addOrderBy(`CASE ${cases.join(' ')} ELSE 3 END`, 'ASC');
}

/** Seller-owned equivalent of {@link applyBusinessNearOrder}. */
export function applySellerNearOrder<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  sellerAlias: string,
  sellerUserColumn: string,
  filter?: LocationFilterDto | null,
): void {
  if (!filter) return;
  const { cases, params } = nearCaseSql('geo', filter, 'sellerOrder');
  if (!cases.length) return;

  query.setParameters({
    ...params,
    sellerOrderStatus: BusinessStatus.PUBLISHED,
  });
  query.addOrderBy(
    `(SELECT MIN(CASE ${cases.join(' ')} ELSE 3 END)
      FROM "businesses" geo
      WHERE geo."userId" = "${sellerAlias}"."${sellerUserColumn}"
        AND geo."status" = :sellerOrderStatus
        AND geo."deleted_at" IS NULL)`,
    'ASC',
  );
}
