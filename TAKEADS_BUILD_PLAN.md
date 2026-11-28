# TakeAds Integration — Build Plan

Status: **Plan only. No TakeAds code has been implemented yet.**
Source of requirements: [`TAKEADS_INTEGRATION_GUIDE.md`](./TAKEADS_INTEGRATION_GUIDE.md)

This plan covers the full feature: backend integration, Admin Dashboard, and the public
marketplace pages that display approved TakeAds offers.

---

## 1. Guiding principle

TakeAds supplies **affiliate opportunities and tracking**. MCOM Mall owns the
**marketplace, approval workflow, presentation, and customer journey**.

Hard rules that shape every task below:

- The frontend never calls TakeAds. Only the NestJS backend does.
- Imported data is **not public** until an admin approves and publishes it.
- Approval and publication are separate states.
- An external offer must be clearly labelled and must not look like a product sold,
  stocked, or fulfilled by MCOM Mall.
- A click is not a sale. A `PENDING` action is not confirmed revenue.
- We do not invent coupon codes, discounts, prices, stock, expiry dates, or product
  details. Display only source-supported data.
- Do not assume TakeAds provides a full product catalogue. Merchants, coupons, and
  URL link-resolution are the documented capabilities.

---

## 2. What already exists in this repo

Understanding these saves us from rebuilding solved problems.

| Area | Current state | Reuse? |
| --- | --- | --- |
| Awin promotional offers | `apps/mcom_mallAPI/src/resources/promotional-offer/` — entities, admin/public controllers, click ledger, transaction sync, admin UI at `/admin/promotional-offers` | **Yes, as the pattern reference.** Do not modify Awin behaviour. |
| Marketplace listing types | `apps/McomMall/app/marketplace/MarketplaceClient.tsx` already merges products, services, businesses, vouchers, gift cards, coupons and `promotional` offers | **Yes, extend with `takeads`.** |
| External offer card | `apps/McomMall/components/promotional/ExternalOfferCard.tsx` | **Yes, as a visual/UX reference.** Build a TakeAds-specific card. |
| Admin navigation | `apps/McomMallAdmin/app/admin/data/navigation.ts` (`navItems`, groups: overview/commerce/payments/people/trust/content) | **Yes, add one nav item.** |
| Admin API client | `apps/McomMallAdmin/service/api.ts` (axios, bearer token) | **Yes.** |
| Public API client | `apps/McomMall/service/api.ts` + React Query hooks pattern | **Yes.** |
| Scheduler | `@nestjs/schedule` already enabled in `app.module.ts` (`ScheduleModule.forRoot()`) | **Yes, use `@Cron`.** |
| TakeAds backend scaffold | `apps/mcom_mallAPI/src/resources/takeads/{dto,entities}/` — empty directories | **Fill these in.** |
| TakeAds admin scaffold | `apps/McomMallAdmin/app/admin/takeads/{merchants,coupons,offers,reports,settings}/page.tsx` — all empty files | **Implement these pages.** |
| TakeAds admin service scaffold | `apps/McomMallAdmin/service/takeads/` — empty | **Fill in `types.ts` + `hook.ts`.** |
| TakeAds env | `apps/mcom_mallAPI/.env` contains `TAKEADS_KEY` | **Wire it up, and add the account key.** |

### Environment note

Only one key exists today: `TAKEADS_KEY`. The TakeAds OpenAPI spec uses **two**
credentials:

- **Platform public key** — merchants, coupons, link resolution.
- **Account public key** — click/action reports.

Add to `apps/mcom_mallAPI/.env` (never commit real values; `.env` is gitignored):

```env
TAKEADS_PLATFORM_API_KEY=...   # can default to TAKEADS_KEY for now
TAKEADS_ACCOUNT_API_KEY=...    # required for reporting
TAKEADS_API_BASE=https://api.takeads.com
TAKEADS_DEFAULT_COUNTRY=GB
TAKEADS_DEFAULT_LANGUAGE=en
TAKEADS_IP_HASH_SALT=change-me
```

Backend code should resolve the platform key as
`process.env.TAKEADS_PLATFORM_API_KEY || process.env.TAKEADS_KEY`, so the existing
value works immediately, while still supporting the documented two-key setup.
If the account key is missing, reporting endpoints must return a clear
"reporting not configured" state, not crash.

---

## 3. Architecture decision

### Recommended: a dedicated `takeads` module with its own tables

Do **not** overload the Awin `promotional_offers` tables. Reasons:

- `promotional_offers` is tied to the Awin business-import/claim model
  (`availability`, `business_promotional_offers`, `businessCommissionRate`).
- TakeAds needs merchant/coupon catalogues, an explicit review lifecycle, source
  identifiers, upstream freshness, and its own reporting statuses.
- Mixing the two risks breaking a live revenue feature.

Instead:

```text
TakeAds API
  merchants · coupons · resolve · stats
        │ server-to-server (Bearer keys)
        ▼
TakeadsModule (NestJS)
  client · sync · approval · public read · click redirect · reporting
        │
        ▼
takeads_* tables (MCOM database)
        │
        ├──────────────► Admin Dashboard  /admin/takeads/*
        │
        └──────────────► Public marketplace  /marketplace, /deals, /takeads/[id]
```

A later, optional phase can bridge approved TakeAds offers into
`promotional_offers` if we want one physical table. Do not do that in v1.

---

## 4. Data model

Create migration:
`apps/mcom_mallAPI/src/database/migrations/1800000000060-AddTakeadsIntegration.ts`

All tables extend the repo's base entity shape (`id` uuid, `created_at`,
`updated_at`, `deleted_at`) unless noted.

### 4.1 `takeads_merchants`

| Column | Type | Notes |
| --- | --- | --- |
| `externalMerchantId` | varchar, unique | TakeAds `merchantId`; the identity key |
| `name` | varchar | |
| `imageUrl` | varchar(2048) nullable | |
| `defaultDomain` | varchar nullable | |
| `domains` | jsonb / simple-array | |
| `description` | text nullable | |
| `upstreamCategoryId` | varchar nullable | TakeAds category |
| `currencyCode` | varchar(8) nullable | |
| `countryCodes` | simple-array / jsonb | |
| `isActive` | boolean | upstream state |
| `deeplinkAllowed` | boolean | |
| `commissionMetadata` | jsonb nullable | whatever the API returns |
| `trackingLink` | varchar(2048) nullable | merchant-level link if supplied |
| `rawPayload` | jsonb | full source record for audit |
| `lastSyncedAt` | timestamptz | |
| `mcomStatus` | varchar(20) | `not_reviewed` \| `accepted` \| `rejected` \| `inactive` |
| `mcomSectorId` / `mcomCategoryId` / `mcomSubCategoryId` | varchar nullable | MCOM taxonomy mapping |
| `reviewNote` | text nullable | |
| `reviewedBy` | uuid nullable | |
| `reviewedAt` | timestamptz nullable | |

Indexes: unique `externalMerchantId`, `mcomStatus`, `isActive`.

### 4.2 `takeads_coupons`

| Column | Type | Notes |
| --- | --- | --- |
| `externalCouponId` | varchar, unique | |
| `merchantId` | uuid FK nullable | local `takeads_merchants.id` |
| `externalMerchantId` | varchar | denormalised for sync |
| `name` | varchar | source offer name |
| `code` | varchar nullable | show only if supplied |
| `description` | text nullable | |
| `imageUrl` | varchar(2048) nullable | |
| `trackingLink` | varchar(2048) nullable | source coupon link |
| `startDate` / `endDate` | timestamptz nullable | |
| `isActive` | boolean | upstream state |
| `languageCodes` / `countryCodes` / `upstreamCategoryIds` | simple-array / jsonb | |
| `rawPayload` | jsonb | |
| `lastSyncedAt` | timestamptz | |
| `approvalStatus` | varchar(20) | `pending` \| `approved` \| `rejected` |
| `publicationStatus` | varchar(20) | `unpublished` \| `published` \| `paused` \| `expired` \| `withdrawn` |
| `adminDisabled` | boolean | default false |
| presentation overrides | | see `takeads_offers` below — coupons may be promoted directly or converted into an offer |

Indexes: unique `externalCouponId`, `merchantId`, `approvalStatus`,
`publicationStatus`, `endDate`.

### 4.3 `takeads_offers` — the publishable record

This is the core admin-managed record. It can be created from a coupon or from a
product/merchant destination URL.

| Column | Type | Notes |
| --- | --- | --- |
| `sourceType` | varchar(20) | `coupon` \| `product_url` \| `merchant` |
| `externalMerchantId` | varchar nullable | |
| `externalCouponId` | varchar nullable | |
| `externalProgramId` | varchar nullable | only if available |
| `merchantName` | varchar | |
| `destinationUrl` | varchar(2048) | original merchant/product URL |
| `resolvedTrackingUrl` | varchar(2048) nullable | returned by resolve endpoint |
| `linkResolvedAt` | timestamptz nullable | |
| `subId` | varchar(30), unique nullable | MCOM attribution code |
| `title` | varchar(200) | MCOM display title |
| `shortDescription` | text nullable | |
| `description` | text nullable | |
| `images` | simple-array / jsonb | display images |
| `imageSource` | varchar nullable | provenance / usage note |
| `mcomSectorId` / `mcomCategoryId` / `mcomSubCategoryId` | varchar nullable | |
| `countryCode` | varchar(2) | default `GB` |
| `currency` | varchar(8) | default `GBP` |
| `offerType` | varchar(20) | `product` \| `service` \| `coupon` \| `deal` |
| `campaignLabel` | varchar nullable | |
| `placement` | varchar(40) | e.g. `marketplace`, `deals`, `featured`, `homepage` |
| `termsAndConditions` | text nullable | source terms |
| `startDate` / `endDate` | timestamptz nullable | source validity |
| `approvalStatus` | varchar(20) | `pending` \| `approved` \| `rejected` |
| `publicationStatus` | varchar(20) | `unpublished` \| `published` \| `paused` \| `expired` \| `withdrawn` |
| `upstreamActive` | boolean | refreshed from source |
| `adminDisabled` | boolean | default false |
| `isFeatured` | boolean | default false |
| `displayOrder` | int | default 0 |
| `reviewNote` | text nullable | |
| `reviewedBy` | uuid nullable | |
| `reviewedAt` | timestamptz nullable | |
| `createdById` | uuid nullable | admin user |
| `lastSyncedAt` | timestamptz nullable | |
| `rawPayload` | jsonb nullable | source snapshot |

Indexes: `approvalStatus`, `publicationStatus`, `sourceType`, `externalMerchantId`,
`externalCouponId`, unique `subId`, `(publicationStatus, startDate, endDate)`.

### 4.4 `takeads_clicks` (MCOM-owned click ledger)

| Column | Type | Notes |
| --- | --- | --- |
| `offerId` | uuid FK nullable | `ON DELETE SET NULL` |
| `merchantId` | varchar nullable | external |
| `couponId` | varchar nullable | external |
| `clickRef` | varchar(160), unique | opaque MCOM reference |
| `subId` | varchar(30) nullable | |
| `source` | varchar(40) | `marketplace` \| `deals` \| `featured` \| `homepage` |
| `placement` | varchar(40) nullable | |
| `destinationUrl` | varchar(2048) | |
| `trackingUrl` | varchar(2048) nullable | |
| `referrer` | varchar(2048) nullable | |
| `userAgent` | varchar(512) nullable | |
| `ipHash` | varchar(64) nullable | salted SHA-256, no raw IP |
| `created_at` only | timestamptz | no need for `updated_at` |

### 4.5 `takeads_sync_runs`

| Column | Type | Notes |
| --- | --- | --- |
| `type` | varchar(20) | `merchants` \| `coupons` \| `reports` \| `resolve` |
| `status` | varchar(20) | `running` \| `success` \| `failed` |
| `startedAt` / `finishedAt` | timestamptz | |
| `itemsReceived` / `itemsCreated` / `itemsUpdated` / `itemsFailed` | int | |
| `errorMessage` | text nullable | |
| `watermark` | varchar nullable | last `updatedAtFrom` cursor |

### 4.6 `takeads_click_reports` (daily aggregates)

Unique key: `(date, adspaceId, merchantId, couponId, subId)`.

Columns: `date` (date), `adspaceId`, `merchantId`, `merchantName`, `couponId`,
`subId`, `count` int, `updatedAt` timestamptz, `rawPayload` jsonb.

### 4.7 `takeads_actions` (conversion/action records)

| Column | Type | Notes |
| --- | --- | --- |
| `actionId` | varchar, unique | TakeAds id |
| `actionNumericId` | varchar nullable | |
| `status` | varchar(20) | `PENDING` \| `CONFIRMED` \| `CANCELED` \| `SETTLED` |
| `type` | varchar(20) | `LEAD` \| `SALE` \| `CLICK` \| `BONUS` |
| `merchantId` / `adspaceId` / `programId` / `couponId` / `subId` | varchar nullable | |
| `orderAmount` / `publisherRevenue` | numeric | preserve currency |
| `currencyCode` | varchar(8) | |
| `advertiserPaid` | boolean | separate from status |
| `orderDate` / `clickId` / `createdAt` / `updatedAt` | | source timestamps |
| `rawPayload` | jsonb | |

Indexes: unique `actionId`, `status`, `subId`, `merchantId`, `updatedAt`.

---

## 5. Backend implementation

### 5.1 Module layout

Fill in the existing empty folders:

```text
apps/mcom_mallAPI/src/resources/takeads/
├── takeads.module.ts
├── takeads.client.ts                 # low-level HTTP client + auth + retries
├── takeads-sync.service.ts           # merchants, coupons, reports sync
├── takeads-admin.service.ts          # review, configure, publish, stats
├── takeads-admin.controller.ts       # /admin/takeads/*
├── takeads-public.service.ts         # publishable reads + click redirect
├── takeads-public.controller.ts      # /takeads/*
├── takeads.mapper.ts                 # source -> local record mapping
├── takeads.constants.ts              # statuses, limits, labels
├── dto/
│   ├── takeads-query.dto.ts
│   ├── update-merchant.dto.ts
│   ├── create-offer.dto.ts
│   ├── update-offer.dto.ts
│   └── sync.dto.ts
└── entities/
    ├── takeads-merchant.entity.ts
    ├── takeads-coupon.entity.ts
    ├── takeads-offer.entity.ts
    ├── takeads-click.entity.ts
    ├── takeads-sync-run.entity.ts
    ├── takeads-click-report.entity.ts
    └── takeads-action.entity.ts
```

Register `TakeadsModule` in `apps/mcom_mallAPI/src/app.module.ts` (next to
`PromotionalOfferModule`) and import the entities into
`TypeOrmModule.forFeature([...])`.

### 5.2 `TakeadsClient`

Single place that talks to `https://api.takeads.com`.

- Methods:
  - `listMerchants(params)` — `GET /v1/product/monetize-api/v2/merchant`
  - `resolveLinks(iris, subId, withImages)` — `PUT /v1/product/monetize-api/v2/resolve`
  - `listCoupons(params)` — `GET /v1/product/monetize-api/v1/coupon`
  - `searchCoupons(body)` — `POST /v1/product/monetize-api/v1/coupon/search`
  - `recommendedCoupons(params)` — `GET /v1/product/monetize-api/v1/coupon/recommended`
  - `clickReport(params)` — `GET /v2/api/stats/click`
  - `actionReport(params)` — `GET /v3/api/stats/action`
- Auth: `Authorization: Bearer <key>`; platform key for catalog/resolve,
  account key for stats.
- Pagination helpers that follow `meta.next` (catalog/actions) and
  `meta.offset` (click reports).
- Timeouts (`AbortSignal.timeout`), bounded retries with backoff for 5xx/429,
  explicit errors for 401/403.
- Redact the `Authorization` header from every log.
- Never log full merchant/coupon payloads at info level.

### 5.3 Sync service (`takeads-sync.service.ts`)

Responsibilities:

- **Merchant sync**: paginate all active merchants (optionally `updatedAtFrom`
  watermark with a small overlap). Upsert by `externalMerchantId`. Update
  `isActive`, `deeplinkAllowed`, metadata, `lastSyncedAt`, `rawPayload`.
- **Coupon sync**: paginate coupons filtered by `countryCodes` / `languageCodes`
  defaults. Upsert by `externalCouponId`. Recompute `isActive` and dates.
- **Report sync**: daily click aggregates and actions, upsert by their unique
  keys. Never delete; never treat `PENDING` as earnings.
- **Resolve refresh**: re-resolve tracking links for published offers on a
  schedule; store `resolvedTrackingUrl`, `linkResolvedAt`.
- **Failure handling**: if a request fails, leave existing rows untouched, write a
  `takeads_sync_runs` failure row, and surface it in Admin Overview.
- **Change detection**: if an approved offer's source terms, dates, destination,
  or upstream active state change materially, set `upstreamActive=false` and/or
  flag for review; stop publishing it. Keep the record for audit.
- **Cron**: e.g. merchants + coupons daily at 02:30, reports daily at 03:30,
  link refresh weekly. Guard each job with `TAKEADS_SYNC_ENABLED` and key
  presence. Manual sync is always available from Admin.
- **subId generation**: at offer creation, generate a unique code
  `mm_` + 10 lowercase base36 chars (≤30 chars, `[a-z0-9_]` only). Resolve links
  one offer per request because the API accepts one `subId` per call.

### 5.4 Admin service/controller

All routes use `@UseGuards(RolesGuard)` + `@Roles(UserRole.ADMIN)` and
`@ApiBearerAuth()`, matching `promotional-offers.admin.controller.ts`.

### 5.5 Public service/controller

Use `@Public()` on read/click routes, matching `promotional-offers.controller.ts`.
Enforce publication rules **server-side** in the query, not just in the UI.

**Publishability predicate** (single helper, reused by list, detail, click):

```text
approvalStatus = 'approved'
AND publicationStatus = 'published'
AND adminDisabled = false
AND upstreamActive = true
AND (startDate IS NULL OR startDate <= now)
AND (endDate IS NULL OR endDate >= now)
AND resolvedTrackingUrl IS NOT NULL
AND (coupon-backed => source coupon isActive and within dates)
```

Click route:

1. Load offer and re-check publishability.
2. If not publishable: do **not** redirect to a merchant; return `410`/`404` with
   an "offer unavailable" payload, and the public page shows the unavailable state.
3. Create `takeads_clicks` row with `clickRef`, `subId`, `source`, `placement`,
   hashed IP, referrer, UA.
4. `302` redirect to `resolvedTrackingUrl`.
5. Optionally append no extra query params — the TakeAds tracking link already
   carries attribution. Do not mutate merchant terms.

### 5.6 Status rules

Keep one source of truth in `takeads.constants.ts`:

- `ApprovalStatus`: `pending | approved | rejected`
- `PublicationStatus`: `unpublished | published | paused | expired | withdrawn`
- `MerchantReviewStatus`: `not_reviewed | accepted | rejected | inactive`
- `ActionStatus`: `PENDING | CONFIRMED | CANCELED | SETTLED`

State machine:

```text
Imported → Pending review → Approved → Published
                                   ├── Paused
                                   ├── Expired (date-driven)
                                   └── Withdrawn
Rejected (terminal unless resubmitted)
```

Approving never publishes automatically. Publishing requires approval + valid
link + upstream active + valid dates.

---

## 6. API contract

Global prefix is `api/v1` (already set in `main.ts`).

### 6.1 Admin — `/api/v1/admin/takeads`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/overview` | connection status, last syncs, counts, click/action/commission summaries |
| GET | `/settings` | enabled capabilities, base URL presence (never key values), defaults |
| PATCH | `/settings` | enable/disable capabilities, default country/language |
| POST | `/sync` | body `{ type: 'merchants' \| 'coupons' \| 'reports' \| 'all' }` |
| GET | `/sync-runs` | recent sync history + errors |
| GET | `/merchants` | paginated/filterable imported merchants |
| GET | `/merchants/:id` | merchant detail + related coupons/offers |
| PATCH | `/merchants/:id/review` | accept/reject/inactive + taxonomy mapping + note |
| GET | `/coupons` | paginated/filterable coupons |
| GET | `/coupons/:id` | coupon detail |
| PATCH | `/coupons/:id/review` | approve/reject/publish/pause/withdraw |
| GET | `/offers` | imported offer list |
| POST | `/offers` | create offer from coupon or destination URL |
| GET | `/offers/:id` | offer detail |
| PATCH | `/offers/:id` | edit MCOM presentation + scheduling |
| POST | `/offers/:id/resolve-link` | call TakeAds resolve, store tracking URL |
| PATCH | `/offers/:id/approve` | approve |
| PATCH | `/offers/:id/reject` | reject with note |
| PATCH | `/offers/:id/publish` | publish (validates predicate) |
| PATCH | `/offers/:id/pause` | pause |
| PATCH | `/offers/:id/withdraw` | withdraw |
| GET | `/offers/:id/preview` | admin preview payload |
| GET | `/reports/summary` | MCOM vs TakeAds metrics |
| GET | `/reports/clicks` | MCOM click ledger + TakeAds aggregates |
| GET | `/reports/actions` | TakeAds actions by status/merchant/campaign |
| POST | `/reports/sync` | manual report pull |

### 6.2 Public — `/api/v1/takeads`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/offers` | approved + published offers; filters: `q`, `categoryId`, `sectorId`, `merchant`, `offerType`, `placement`, `country`, `page`, `limit` |
| GET | `/offers/:id` | public offer detail |
| GET | `/offers/:id/click` | record click + `302` redirect |
| GET | `/deals` | coupon/deal feed (same predicate, `offerType=coupon\|deal`) |

Public responses must include display labels/source metadata so the UI can render
`National Brand`, `Affiliate Offer`, `Coupon / Deal` and the disclosure.

---

## 7. Admin Dashboard plan

### 7.1 Navigation

Add to `apps/McomMallAdmin/app/admin/data/navigation.ts` under the
`commerce` group:

```ts
{
  title: 'TakeAds Integration',
  href: '/admin/takeads',
  icon: BadgePercent, // or Link2 / Globe
  description: 'External affiliate merchants, coupons and approved offers',
  group: 'commerce',
}
```

### 7.2 Service layer

Create:

```text
apps/McomMallAdmin/service/takeads/
├── types.ts   # mirrors the API contract
└── hook.ts    # React Query queries/mutations
```

Follow the conventions in `service/promotional-offers/hook.ts`:
`useQuery` keys, `useMutation`, `invalidateQueries`, `toast.success/error`,
`api.get/post/patch`.

### 7.3 Pages

Replace the empty scaffold files:

| Route | Content |
| --- | --- |
| `/admin/takeads` | **Overview**: connection badge, key presence (platform/account), last sync per type, counts (merchants, coupons, pending, published), MCOM clicks vs TakeAds clicks/actions, approved commission, recent sync errors, quick actions (`Sync merchants`, `Sync coupons`, `Sync reports`). |
| `/admin/takeads/merchants` | Searchable table: name, logo, country, active/deeplink, commission metadata, MCOM status, last synced. Row opens detail. |
| `/admin/takeads/merchants/[id]` | Merchant detail, taxonomy mapping, review note, accept/reject/inactive, related coupons and offers. |
| `/admin/takeads/coupons` | Table: merchant, name, code, dates, active, approval, publication, last synced. Filters. Bulk approve where safe. |
| `/admin/takeads/coupons/[id]` | Coupon detail + source fields + review actions + "Create offer from coupon". |
| `/admin/takeads/offers` | Offer table with approval/publication badges, merchant, type, placement, clicks, actions, dates. |
| `/admin/takeads/offers/new` | Create from coupon or destination URL. URL flow: paste authorised product URL → resolve link → preview. |
| `/admin/takeads/offers/[id]` | Edit MCOM presentation (title, descriptions, images, taxonomy, offer type, campaign label, placement, schedule, featured/order), source panel (read-only), link resolution status, preview, lifecycle actions. |
| `/admin/takeads/reports` | Date-range + merchant/campaign/placement/status filters. Separate sections: MCOM clicks, TakeAds click aggregates, TakeAds actions (PENDING/CONFIRMED/CANCELED/SETTLED), `advertiserPaid`, commission. |
| `/admin/takeads/settings` | Connection status, enabled capabilities, defaults, sync schedule visibility, key-presence indicators. No secret values. |

UI conventions to copy from `/admin/promotional-offers`:

- `StatCard` row at the top.
- `Card` + `Table` for lists.
- `Badge` colour mapping for statuses.
- `AlertDialog` for destructive/lifecycle actions.
- Loading skeletons and error states.
- Search input + `Select` filters + pagination.

### 7.4 Admin guardrails (UI + API)

- Source fields are read-only in the edit form.
- Presentation fields are editable.
- Do not allow editing `destinationUrl` on an imported record (only via re-resolve
  or creating a new offer).
- Do not allow inventing a coupon code or changing source terms.
- "Publish" is disabled until approval + valid tracking link + valid dates.
- Show a clear warning when an approved offer's upstream data has changed or
  expired.

---

## 8. Public marketplace plan

### 8.1 Service layer

```text
apps/McomMall/service/takeads/
├── types.ts
└── hook.ts
```

Include a helper:

```ts
getTakeadsClickUrl(offerId, { source, placement })
// -> `${baseURL}/takeads/offers/${offerId}/click?source=...&placement=...`
```

Never build a link directly to the merchant in the browser.

### 8.2 Components

- `apps/McomMall/components/takeads/TakeadsOfferCard.tsx`
  - image, title, merchant, offer type
  - labels: `National Brand`, `Affiliate Offer`, `Coupon / Deal`
  - price **only if supplied**; otherwise "View offer at merchant"
  - CTA via the click route, `target="_blank"`, `rel="noopener noreferrer"`
  - disclosure line
- `apps/McomMall/components/takeads/TakeadsOffersSection.tsx`
  - horizontal/grid section for homepage/marketplace
- `apps/McomMall/components/takeads/TakeadsDisclosure.tsx`
  - reusable affiliate disclosure text

### 8.3 Pages / integration points

| Surface | Change |
| --- | --- |
| `/marketplace` (`MarketplaceClient.tsx`) | Add `takeads` to `ListingType`, filters, and the merged item list. Add a source filter (`Local Business` / `National Brand`). Render `TakeadsOfferCard` for these items. |
| `/marketplace` sidebar | Add a "Source" filter group and a "Deals & Coupons" category. |
| `/deals` (new) | External deals/coupons feed backed by `GET /takeads/deals`. Card shows merchant, code only if supplied, validity only if supplied, conditions, CTA. |
| `/takeads/[id]` (new) | Offer detail: merchant, type, description, terms, dates, disclosure, CTA, unavailable/expired state. |
| Homepage | Add a `TakeadsOffersSection` ("National brand offers") if approved offers exist; hide entirely when empty. |
| Search | Include approved TakeAds offers in marketplace search results (server-side filter). |

Do **not** add TakeAds items to the business dashboard imports/catalogue. They are
platform-managed, not business-claimed.

### 8.4 Public UX rules

- Label the source clearly on every card and detail page.
- Show the affiliate disclosure on detail pages and near the CTA.
- Explain: "You'll complete this purchase on the merchant's website."
- If the offer is unavailable/expired: disable the CTA and show an unavailable
  state. Never redirect to a plain merchant URL as a fallback for a monetised
  offer.
- Do not show a discount %, code, price, or expiry unless the source supplies it.
- Never render TakeAds keys or raw API payloads.

---

## 9. Attribution and reporting

### 9.1 subId convention

- Generate at offer creation: `mm_` + 10 base36 chars → e.g. `mm_4f9a2c7b1e`.
- Max 30 chars, only letters/digits/`_`/`-` (click report limit).
- One `subId` per resolve request.
- Store on the offer and copy onto every click row.
- No personal data in `subId`.

### 9.2 Reconciliation

Keep two separate views and never merge them into one number:

1. **MCOM events** — impressions (if added), detail views, outbound clicks from
   `takeads_clicks`, grouped by offer/campaign/placement/source.
2. **TakeAds reports** — click aggregates (`takeads_click_reports`) and actions
   (`takeads_actions`), grouped by merchant/coupon/subId/date/status.

Match using `subId`, merchant/coupon IDs, and dates. Show a note that counts can
differ due to tracking, attribution, delays, and invalid activity.

Commission display:

- `PENDING` → "Pending", not revenue.
- `CONFIRMED`/`SETTLED` → show separately.
- `advertiserPaid` → show as its own flag; do not equate with `status`.

---

## 10. Security and operations

- Keys only in backend env; never in `NEXT_PUBLIC_*`, never in browser requests.
- Redact `Authorization` headers and raw payloads from logs.
- Admin routes require `UserRole.ADMIN`.
- Public routes enforce publishability server-side.
- Salted IP hashing only; no raw IP storage; no PII in `subId` or TakeAds calls.
- Timeouts + bounded retries; explicit handling of 401/403/429/5xx.
- Rate-limit awareness: paginate, avoid parallel hammering, cache in DB.
- Never delete imported records on upstream failure. Mark and surface.
- Retain expired/withdrawn/rejected records for audit and reporting.
- Add a feature flag (e.g. `TAKEADS_SYNC_ENABLED`) so local/preview environments
  without keys stay healthy.
- Legal/compliance review of the affiliate disclosure before launch.

---

## 11. Phased delivery

Each phase should be shippable and independently verifiable.

### Phase 0 — Access and configuration (no UI)

- Confirm platform approval/domain with TakeAds.
- Add `TAKEADS_PLATFORM_API_KEY`, `TAKEADS_ACCOUNT_API_KEY`, base URL, defaults.
- Add config helper with key-presence checks and safe logging.
- **Acceptance:** authenticated test call to `/merchant` succeeds; missing-key
  states return a clear error without crashing.

### Phase 1 — Database + module skeleton

- Migration `1800000000060-AddTakeadsIntegration.ts`.
- Entities, module, client, constants, mapper.
- Register in `app.module.ts`.
- **Acceptance:** migration runs up/down; app boots; health endpoint reports
  TakeAds configured/unconfigured.

### Phase 2 — Merchant sync + Admin merchants

- Merchant pagination/upsert, sync runs, manual sync endpoint.
- Admin overview + merchants list/detail/review.
- **Acceptance:** admin can sync merchants, see counts/last-sync/errors, map a
  merchant to an MCOM category, and accept/reject it.

### Phase 3 — Link resolution

- Resolve endpoint + `subId` generation + storage.
- Admin "create offer from URL" + resolve-link action + preview.
- **Acceptance:** a valid destination resolves to a tracking URL and is stored;
  an empty `data` response is shown as "no eligible offer", not published.

### Phase 4 — Coupon import + review

- Coupon sync, coupon list/detail/review, create offer from coupon.
- **Acceptance:** coupons import idempotently; expired/inactive coupons are never
  publishable; admin can approve/reject.

### Phase 5 — Offer management + approval workflow

- Full offer CRUD, presentation fields, lifecycle endpoints, preview.
- Admin offers pages.
- **Acceptance:** imported → pending → approved → published → paused/withdrawn
  works; publish is blocked without a valid link/dates; source fields read-only.

### Phase 6 — Public marketplace

- Public offers/deals/detail/click endpoints.
- `TakeadsOfferCard`, `TakeadsOffersSection`, `/deals`, `/takeads/[id]`.
- Marketplace + homepage integration, source labels, disclosure.
- **Acceptance:** only approved+published+active+in-date offers appear; CTA
  records a click and redirects to the tracking URL; expired offers show an
  unavailable state; no unapproved item is reachable by URL.

### Phase 7 — Reporting

- Click/action report sync, summaries, admin reports page.
- **Acceptance:** MCOM clicks and TakeAds metrics are displayed separately;
  action statuses and `advertiserPaid` are distinct; pagination/watermarks work;
  re-polling updates rather than duplicates.

### Phase 8 — Rewards / Take Cashback assessment (separate decision)

- Confirm product access and commercial rules.
- Design MCOM Rewards campaign linkage without equating commission to reward.
- **Acceptance:** a written decision and, only if approved, a separate scoped
  implementation.

---

## 12. Testing plan

**Backend unit tests**

- Mapper: merchant/coupon/action mapping, date parsing, currency preservation.
- Status predicate: every combination of approval/publication/upstream/dates.
- `subId` generation: length, charset, uniqueness.
- Pagination/watermark helpers.
- Action status normalisation (never count `PENDING` as confirmed).
- Click route: records then redirects; unavailable offers do not redirect.

**Backend integration/e2e**

- Admin auth: non-admin gets 403.
- Sync idempotency: run twice → no duplicates.
- Upstream failure preserves existing records.
- Public list excludes unapproved/disabled/expired/out-of-date offers.
- Click creates a ledger row with `subId`, `source`, `placement`.

**Admin UI**

- Overview empty/loading/error/configured states.
- Merchant and coupon filters + pagination.
- Offer create (coupon and URL), edit, approve, publish, pause, withdraw.
- Publish blocked without link/dates.
- Reports filters and status badges.

**Public UI**

- Marketplace mixed results + source filter.
- `/deals` only shows valid deals.
- Detail page disclosure and unavailable state.
- CTA hits the MCOM click route (not the merchant directly).
- Mobile layout and empty states.

---

## 13. Open questions to confirm with TakeAds

1. Is the MCOM Mall platform/domain approved for production API integration?
2. Which keys are issued: platform, account, or both — and what do they authorise?
3. Are merchant and coupon endpoints enabled for this account?
4. Are recommended coupons and coupon search enabled?
5. Which UK merchants/programmes are available?
6. What is the supported source for programme eligibility/terms, given the
   deprecated `/program` endpoint?
7. What programme restrictions apply to presentation, search marketing,
   incentives, coupon use, and disclosure?
8. Is Take Cashback included, or a separate commercial arrangement?
9. What are the reporting delays, action correction rules, and payment process?
10. Are there rate limits, tracking-link expiry rules, or extra attribution
    requirements at our expected volume?

---

## 14. File-by-file checklist

### Backend

- [ ] `apps/mcom_mallAPI/.env` — add platform/account keys, base URL, defaults, salt
- [ ] `src/database/migrations/1800000000060-AddTakeadsIntegration.ts`
- [ ] `src/resources/takeads/entities/*.entity.ts` (7 entities)
- [ ] `src/resources/takeads/takeads.constants.ts`
- [ ] `src/resources/takeads/takeads.client.ts`
- [ ] `src/resources/takeads/takeads.mapper.ts`
- [ ] `src/resources/takeads/takeads-sync.service.ts`
- [ ] `src/resources/takeads/takeads-admin.service.ts`
- [ ] `src/resources/takeads/takeads-admin.controller.ts`
- [ ] `src/resources/takeads/takeads-public.service.ts`
- [ ] `src/resources/takeads/takeads-public.controller.ts`
- [ ] `src/resources/takeads/dto/*.dto.ts`
- [ ] `src/resources/takeads/takeads.module.ts`
- [ ] `src/app.module.ts` — register module
- [ ] `docs/takeads.md` — operator runbook (sync, review, publish, reporting)

### Admin

- [ ] `apps/McomMallAdmin/service/takeads/types.ts`
- [ ] `apps/McomMallAdmin/service/takeads/hook.ts`
- [ ] `app/admin/data/navigation.ts` — add nav item
- [ ] `app/admin/takeads/page.tsx` — overview
- [ ] `app/admin/takeads/merchants/page.tsx`
- [ ] `app/admin/takeads/merchants/[id]/page.tsx`
- [ ] `app/admin/takeads/coupons/page.tsx`
- [ ] `app/admin/takeads/coupons/[id]/page.tsx`
- [ ] `app/admin/takeads/offers/page.tsx`
- [ ] `app/admin/takeads/offers/new/page.tsx`
- [ ] `app/admin/takeads/offers/[id]/page.tsx`
- [ ] `app/admin/takeads/reports/page.tsx`
- [ ] `app/admin/takeads/settings/page.tsx`

### Public

- [ ] `apps/McomMall/service/takeads/types.ts`
- [ ] `apps/McomMall/service/takeads/hook.ts`
- [ ] `components/takeads/TakeadsOfferCard.tsx`
- [ ] `components/takeads/TakeadsOffersSection.tsx`
- [ ] `components/takeads/TakeadsDisclosure.tsx`
- [ ] `app/(public)/deals/page.tsx`
- [ ] `app/(public)/takeads/[id]/page.tsx`
- [ ] `app/marketplace/MarketplaceClient.tsx` — add `takeads` listing type + source filter
- [ ] Homepage section (where approved offers exist)
- [ ] Search integration

---

## 15. Definition of done

The feature is done when:

1. An admin can sync TakeAds merchants and coupons, review them, create an offer
   from a coupon or a destination URL, resolve a tracking link, configure the
   MCOM presentation, preview it, approve it, and publish it.
2. The public marketplace shows only approved, published, upstream-active,
   in-date offers, clearly labelled and disclosed.
3. Clicking a public CTA records an MCOM click and redirects to the stored
   TakeAds tracking URL; expired/unavailable offers cannot be clicked through.
4. Admin reporting shows MCOM clicks and TakeAds clicks/actions/commission
   separately, with correct statuses and no false "earnings".
5. Sync is idempotent, failure-safe, scheduled, and manually triggerable.
6. Credentials never reach the frontend, and logs contain no secrets.
7. Awin promotional offers, local business products/services, and existing
   moderation continue to work unchanged.
