# Marketplace Location System

The marketplace now filters **every listing type** — products, services,
vouchers, gift cards and coupon products — by the seller's MCOM Central
geographic hierarchy:

```
City → Borough → High Street → Local Mall
```

The shopper can pick any node, or use their own location. Results in a broader
scope are ordered local mall → high street → borough → city.

## Why this shape

Central already assigns each business from its signup postcode. The marketplace
therefore only needs a **local, denormalised copy** of that assignment. This is
the key performance decision:

- No Central call per marketplace request.
- No deep joins from each listing table to a geography graph.
- Every filter is an indexed predicate on `businesses`.

### Schema

`businesses` gains:

| column | purpose |
| --- | --- |
| `geoCityId`, `geoCityName` | city subtree filter |
| `geoBoroughId`, `geoBoroughName` | borough subtree filter |
| `geoHighStreetId`, `geoHighStreetName` | high-street subtree filter |
| `geoLocalMallId`, `geoLocalMallName` | local-mall subtree filter |
| `geoLatitude`, `geoLongitude` | nearest-city fallback for non-UK shoppers |
| `geoResolvedAt` | freshness / backfill marker |

Composite indexes on each `(geo*Id, status)` keep the hot path index-only.
`geo_postcode_resolutions` caches one resolution per UK outward code.

## How the columns are populated

1. **SSO login** — after Central identity sync, one
   `GET /data/local-mall?userId=...` call writes the exact assignment. This is
   best-effort with a 5 second timeout; it can never block sign-in. The local
   copy is refreshed at most once a day.
2. **Backfill worker** — enabled by default. It runs once 30 seconds after
   startup, then every 10 minutes, resolving at most `GEO_BACKFILL_BATCH`
   outward codes (default 25) with two Central calls at a time. One lookup
   covers every business in that outcode. A Postgres advisory lock ensures
   only one API instance runs the worker at a time. Invalid postcodes are
   negative-cached for 7 days so they are not retried on every run.
   Disable with `GEO_BACKFILL_ENABLED=false`.
3. **Manual backfill** — `POST /marketplace/locations/backfill?batch=50`
   (admin only), or from the API package:
   `npm run geo:backfill -- 50`.

## Pre-backfill behavior

The hierarchy columns are empty until a business logs in through SSO or the
backfill worker resolves its outcode. To keep the marketplace usable during
that window (and when Central is unavailable):

- `GET /marketplace/locations` also returns `areas`, derived from the existing
  `locations.city` / `locations.resolvedArea` fields.
- `GET /marketplace/location/search?q=...` accepts a full UK postcode, an
  outward code (e.g. `SW1A`) or a place name. A postcode always returns an
  outward-code result backed by local `locations.postcode`, independent of the
  hierarchy columns.
- Discovery accepts `locationType=area` (legacy city / resolved area) and
  `locationType=postcode` (outward-code prefix) in addition to the four
  hierarchy levels.

This means searches like `Westminster` or `SW1A 1AA` work on existing data
before the Central hierarchy has been backfilled.

## Central HMAC prerequisite

The exact hierarchy sync calls Central's `GET /data/local-mall`, which is
guarded by HMAC. The mall signs with `MCOM_MALL_HMAC_SECRET` /
`MCOM_HMAC_SECRET` / `SSO_API_SECRET`; Central verifies with
`MCOM_MALL_SECRET` or its global `SSO_API_SECRET`. Both sides must share the
same value.

If that call returns `401`, the code falls back to Central's public
`POST /geography/validate-postcode`, which returns the city, borough, high
street and a suggested mall name. That is enough to populate a usable
hierarchy, but the Central ids (and the exact assigned mall name) require the
HMAC secret to be aligned.

## Request path

- `GET /marketplace/locations` returns the full tree with live business
  counts. Aggregated in one grouped query, cached in-process for 5 minutes and
  via `Cache-Control`.
- `GET /marketplace/location/search?q=...` searches postcodes and place names.
- `GET /marketplace/location/resolve` resolves the shopper:
  1. Central assignment for the signed-in user,
  2. saved/supplied UK postcode,
  3. browser coordinates (reverse geocoded inside the UK),
  4. closest city with businesses for non-UK coordinates.
- The existing public search endpoints accept:
  `locationType`, `locationId`, `locationName`, `nearLocalMallId`,
  `nearHighStreetId`, `nearBoroughId`.
- Voucher / gift-card / coupon-product filters use `EXISTS` against the
  seller's published businesses, so a seller with several businesses cannot
  duplicate rows or inflate counts.
- The landing-page aggregate is cached for 60 seconds per location tuple.

## Rollout

1. Run the TypeORM migration
   `1799900000003-AddBusinessGeoHierarchy`.
2. Deploy the API. Existing rows are backfilled by the worker, or trigger the
   admin endpoint immediately.
3. Deploy the frontend. The location picker persists the shopper's choice in
   `localStorage` and defaults to their resolved location.

## Notes

- Platform-wide coupons in the landing-page aggregate are intentionally not
  location-filtered; merchant coupon products are.
- Shoppers who have not granted location permission and are not signed in see
  "All locations" until they pick a city or press **My location**.
- The resolution/facet caches are in-process. Multiple API instances each keep
  their own small cache; swap the `Map` for Redis if a shared cache is needed.
