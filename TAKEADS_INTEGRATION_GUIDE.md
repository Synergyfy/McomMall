# Takeads Affiliate Integration Guide

This guide describes how MCOM can use the Takeads Public API to curate
advertisers and offers, publish only approved entries, create affiliate links,
and report clicks and purchase actions.

> **Scope:** This is an integration guide, not a claim that Takeads is already
> connected. The existing MCOM promotional-offers integration in
> [`apps/mcom_mallAPI/docs/promotional-offers.md`](apps/mcom_mallAPI/docs/promotional-offers.md)
> uses Awin. Takeads would need its own provider adapter, credentials, sync and
> reporting flow, or a deliberate extension of that module.

## What Takeads does

Takeads is an affiliate monetization service. Its API can:

1. Return participating merchants in its catalog.
2. Resolve a merchant/product URL into a tracked affiliate URL when Takeads
   finds a matching offer.
3. Return merchant coupons and affiliate coupon links.
4. Report click aggregates and conversion/action records for the publisher
   account.

The API is **not** a general product inventory, moderation queue, or public
storefront. It has no documented endpoint for MCOM to approve products, publish
an approved list, or receive purchase webhooks. Those are MCOM responsibilities.

## Recommended MCOM workflow

```text
Takeads catalog / coupons
       │ server-side sync or search
       ▼
MCOM candidate records ── Admin review ── approved records
                                             │
                                             ▼
                                   Public promotions page
                                             │ shopper clicks
                                             ▼
                              MCOM click endpoint / redirect
                                             │
                                             ▼
                                    Takeads tracking URL
                                             │
                         scheduled server-side report polling
                                             ▼
                                MCOM analytics dashboard
```

### 1. Import candidates, not public content

- Sync merchants from `GET /v1/product/monetize-api/v2/merchant`.
- Sync coupons from `GET /v1/product/monetize-api/v1/coupon`, or find
  relevant coupons with the search/recommended endpoints below.
- Store provider IDs and metadata in MCOM, deduplicating by provider plus
  external ID.
- Treat provider data as **pending review** until an MCOM admin approves it.
- Refresh provider metadata and active/date status periodically. A previously
  approved entry should stop displaying if the upstream merchant/coupon is no
  longer active or the coupon has expired.

Takeads' catalog endpoints return **merchants and coupons**, not a general
feed of individual products. For an individual product URL, MCOM can submit
the URL to the link-resolution endpoint, then create an MCOM offer record if
the response contains a matching affiliate link. An empty `data` array means
no matching offer was found; do not publish it as a monetized item.

### 2. Add an MCOM approval gate

Keep provider approval separate from Takeads' eligibility:

- `pending`: imported or submitted in MCOM; not shown publicly.
- `approved`: an MCOM admin has allowed the merchant/coupon/item on the
  platform.
- `rejected`: an admin has declined it.
- `disabled`: an admin has removed it from the public page.

An entry should appear publicly only if it is approved, enabled, upstream
eligible/active, and (for coupons) within its validity dates. Preserve an
admin review note and reviewer/time if the existing moderation pattern is
reused. The repo's catalog approval workflow at
[`apps/mcom_mallAPI/docs/catalog-approval-workflow.md`](apps/mcom_mallAPI/docs/catalog-approval-workflow.md)
currently covers MCOM-owned catalog resources; do not assume it automatically
covers imported Takeads data.

An admin UI should support at least:

- Browse/filter imported candidates by merchant, country, category, active
  state, and review status.
- Inspect the destination domain, coupon terms/dates, commission metadata
  where available, and whether a link resolves.
- Approve, reject, disable, and re-enable records.
- Show sync time and upstream status so staff can spot stale data.

### 3. Serve a page from approved MCOM records

The public promotions page should read from an MCOM API, not call Takeads
directly. That endpoint must filter server-side to approved/enabled records
and apply upstream-active and coupon-date checks. The browser should never
receive Takeads credentials.

For coupons, render the merchant, offer name/description, code (if supplied),
validity dates, and a clear outbound action. For a product-specific link,
render the MCOM-approved item metadata and link through MCOM's click route.

### 4. Redirect clicks through MCOM

Create a click route in MCOM, for example:

```text
GET /api/v1/takeads/offers/:id/click?source=marketplace
```

The route should verify that the record is still publishable, write an
internal click record, then issue a `302` redirect to its stored Takeads
tracking link. Record an opaque MCOM reference and offer/business/source IDs
for diagnostics and MCOM attribution. Do not put personal information in a
Takeads `subId`.

Pass a stable `subId` to Takeads when resolving affiliate links, for example
`mm_biz42_offer15`. Use only letters, digits, `_`, or `-`, and keep it at or
below 30 characters so the same value can be used with both the link resolver
and click-report filter (the resolver accepts longer values, but the click
report documents a 30-character maximum). The API accepts one `subId` per
resolve request; group links by the MCOM attribution value or resolve them in
separate requests when different attribution is needed.

### 5. Poll reports and update MCOM analytics

Run a scheduled server-side job that fetches:

- Click aggregates from `GET /v2/api/stats/click`.
- Actions/conversions from `GET /v3/api/stats/action`.

Use the API's pagination metadata and a persisted cursor/watermark. Upsert
records by Takeads action/aggregate ID and re-fetch a small overlapping
`updatedAt` window so status changes and corrections are not missed. Do not
count `PENDING` actions as confirmed earnings. Keep action status, currency,
order amount, publisher revenue, and `advertiserPaid` separate in analytics:
an action's status and whether the advertiser has paid are different signals.

The published OpenAPI specification documents pull/report endpoints; it does
not document a purchase webhook. Therefore, assume reporting is eventually
updated and poll it. A report can tell MCOM about attributed actions and
commission, but it does not identify the shopper or provide unrestricted
customer/order details.

## Takeads API reference

The documented server is:

```text
https://api.takeads.com
```

These are server-to-server calls. Do not call them from a browser or mobile
client with a provider key.

### Authentication

The OpenAPI specification defines two bearer credentials:

| API group | Credential | Used for |
|---|---|---|
| Take Link / Monetize API | Platform API public key | Merchant, coupon, and link-resolution endpoints |
| Stats API | Account API public key | Action and click reports |

Send the credential in the `Authorization` header:

```http
Authorization: Bearer <TAKEADS_KEY>
```

Use the correct key for each API group. Store both in server-side environment
secrets (for example `TAKEADS_PLATFORM_API_KEY` and
`TAKEADS_ACCOUNT_API_KEY`); never commit real values or expose them to the
frontend. The API specification does not define a key-creation endpoint, so
obtain the credentials through the Takeads account/onboarding process.

### A. Merchant catalog

```http
GET /v1/product/monetize-api/v2/merchant
```

Returns Takeads merchants, with cursor-style pagination. With no parameters,
the documented default is up to 100 merchants.

| Query parameter | Meaning |
|---|---|
| `next` | Integer pointer returned for the next page |
| `limit` | Page size, 1–500; default 100 |
| `updatedAtFrom` | Include merchants updated at or after this ISO 8601 timestamp |
| `isActive` | Filter to active merchants (`true`/`false`) |
| `deeplinkAllowed` | Filter to merchants that allow deeplinks |

The response contains `data` and `meta.next`. Continue requesting pages while
`meta.next` is not `null`, passing that value as `next`. Relevant merchant
fields include `merchantId`, `name`, `imageUri`, `defaultDomain`,
`description`, `categoryId`, `domains`, `currencyCode`, `isActive`,
`deeplinkAllowed`, `countryCodes`, commission and payment metadata, and
`trackingLink`. Use the external `merchantId` as the provider-side identity;
do not use a merchant name as a unique key.

The older `GET /v1/product/monetize-api/v2/program` endpoint is marked
deprecated; the specification says to use the merchant endpoint instead.

### B. Resolve a destination into an affiliate link

```http
PUT /v1/product/monetize-api/v2/resolve
Content-Type: application/json
```

Request body:

```json
{
  "iris": [
    "https://merchant.example/product/123"
  ],
  "subId": "mm_biz42_offer15",
  "withImages": true
}
```

- `iris` is required: an array of merchant or product URLs to resolve.
- `subId` is optional: one attribution value applied to every URL in the
  request. The documented resolver allows letters, digits, `_`, and `-`, up
  to 6144 characters.
- `withImages` is optional; when `true`, the response can include an image
  URL.

The response is under `data`; each resolution can include the requested `iri`,
the resulting `trackingLink`, and `imageUrl`. A URL with no matching offer
returns an empty result array with HTTP `200`; this is not a successful link
to publish. Store the returned tracking link with the approved MCOM record and
refresh it when needed according to Takeads' current guidance.

The older `PUT /v1/product/monetize-api/v1/resolve` endpoint is deprecated;
use the v2 route above.

### C. Coupon catalog

```http
GET /v1/product/monetize-api/v1/coupon
```

Returns coupons and supports these optional filters:

| Query parameter | Meaning |
|---|---|
| `isActive` | Active/inactive coupons |
| `updatedAtFrom`, `updatedAtTo` | Coupon update-time range |
| `startDateBefore` | Coupon start date bound |
| `endDateAfter` | Coupon end date bound |
| `languageCodes` | Merchant language codes (ISO 639-1) |
| `categoryIds` | Coupon category IDs |
| `countryCodes` | Country codes (ISO 3166-1 alpha-2) |
| `merchantId` | Restrict coupons to one merchant |
| `next` | Cursor for the next page |
| `limit` | Page size, 1–500; default 100 |

Use the returned `meta.next` cursor to fetch subsequent pages. Relevant
coupon fields include `couponId`, `isActive`, `trackingLink`, `name`, `code`,
`merchantId`, `imageUri`, `languageCodes`, `startDate`, `endDate`,
`description`, `countryCodes`, and `categoryIds`. Always validate active
status and dates when displaying a coupon.

### D. Search coupons for destination URLs

```http
POST /v1/product/monetize-api/v1/coupon/search
Content-Type: application/json
```

Example:

```json
{
  "iris": ["https://merchant.example/"],
  "languageCodes": ["en"],
  "countryCodes": ["GB"],
  "subId": "mm_biz42_offer15"
}
```

`iris` is required and accepts 1–5 merchant/product URLs. Optional body fields
are `languageCodes`, `categoryIds`, `countryCodes`, and `subId`. Matching
coupons are returned in `data`; no match is an empty array with HTTP `200`.
The result can include the matched URL and coupon data, including its
`trackingLink`. Treat this endpoint as a discovery mechanism, not as MCOM
approval.

### E. Recommended coupons

```http
GET /v1/product/monetize-api/v1/coupon/recommended
```

Optional query filters: `languageCodes`, `categoryIds`, and `countryCodes`.
No matching coupons returns an empty `data` array with HTTP `200`. The result
groups coupons by merchant and includes merchant identification/hostname and
coupon data. Review and persist candidates in MCOM before publishing them.

### F. Conversion/action report

```http
GET /v3/api/stats/action
```

Uses the **Account API public key**. Returns action records, including fields
such as:

- `actionId`, `actionNumericId`, and optional related-action IDs.
- `status`: `PENDING`, `CONFIRMED`, `CANCELED`, or `SETTLED`.
- `type`: `LEAD`, `SALE`, `CLICK`, or `BONUS`.
- `merchantId`, `adspaceId`, optional `programId`, `couponId`, and `subId`.
- `orderAmount`, `publisherRevenue`, `currencyCode`, and `advertiserPaid`.
- `orderDate`, `countryCode`, `clickId`, `createdAt`, and `updatedAt`.

Filters:

| Query parameter | Meaning |
|---|---|
| `updatedAtFrom`, `updatedAtTo` | Action last-updated time bounds |
| `createdAtFrom`, `createdAtTo` | Action creation time bounds |
| `status` | One of the documented action statuses |
| `subId` | Filter to an attribution value |
| `adspaceId` | Filter to a platform UUID |
| `merchantId` | Filter to a merchant |
| `next` | UUID pagination cursor |
| `limit` | Maximum 500; send explicitly |

The response has `data` and `meta.next`; pass a non-null `next` value to
retrieve subsequent pages. `PENDING` may later become confirmed, canceled, or
settled, so update existing MCOM rows rather than treating every poll result
as a new sale. A canceled or related action may correct an earlier record.
`advertiserPaid` is a separate payment flag, not a replacement for `status`.

### G. Click report (recommended V2)

```http
GET /v2/api/stats/click
```

Uses the **Account API public key**. Returns daily click aggregates grouped by
platform and merchant/program or coupon, `subId`, and calendar date. Each
record includes fields such as `adspaceId`, `merchantId`, `merchantName`,
`couponId`, `subId`, `date`, `count`, and `updatedAt`.

Filters:

| Query parameter | Meaning |
|---|---|
| `dateFrom`, `dateTo` | Inclusive UTC calendar-date range; provide both; max 120 days |
| `updatedAtFrom`, `updatedAtTo` | Inclusive ISO 8601 update-time range; provide both |
| `subId` | Attribution filter (documented maximum 30 characters) |
| `adspaceId`, `programId` | Platform/program UUID filters |
| `merchantId` | Merchant filter |
| `offset`, `limit` | Offset pagination; limit 1–500 |

If neither complete date pair is given, the endpoint defaults to the current
UTC calendar day. A complete `updatedAtFrom`/`updatedAtTo` pair without a
date range filters by update time and does not limit the click calendar date.
The response includes `meta.offset`, `meta.limit`, and `meta.total`; request
subsequent pages by increasing `offset`.

The older `GET /v1/api/stats/click` route is deprecated. Use V2.

## Example server-side calls

```bash
curl --get 'https://api.takeads.com/v1/product/monetize-api/v2/merchant' \
  --header "Authorization: Bearer ${TAKEADS_PLATFORM_API_KEY}" \
  --data-urlencode 'isActive=true' \
  --data-urlencode 'limit=100'
```

```bash
curl --request PUT \
  'https://api.takeads.com/v1/product/monetize-api/v2/resolve' \
  --header "Authorization: Bearer ${TAKEADS_PLATFORM_API_KEY}" \
  --header 'Content-Type: application/json' \
  --data '{"iris":["https://merchant.example/product/123"],"subId":"mm_biz42_offer15","withImages":true}'
```

```bash
curl --get 'https://api.takeads.com/v3/api/stats/action' \
  --header "Authorization: Bearer ${TAKEADS_ACCOUNT_API_KEY}" \
  --data-urlencode 'updatedAtFrom=2026-11-20T00:00:00.000Z' \
  --data-urlencode 'updatedAtTo=2026-11-27T23:59:59.999Z' \
  --data-urlencode 'limit=500'
```

Use a server HTTP client in production rather than shelling out to `curl`.
Handle non-2xx responses explicitly; do not interpret an empty `200` response
as an approved offer.

## Suggested MCOM data model

This is a proposed shape, not an existing Takeads schema:

| Field | Purpose |
|---|---|
| `provider` | `takeads` |
| `externalMerchantId`, `externalCouponId` | Stable upstream identifiers |
| `destinationUrl`, `trackingLink` | Destination and resolved affiliate URL |
| `name`, `description`, `imageUrl`, `countryCodes`, `categoryIds` | Display/filter metadata |
| `isUpstreamActive`, `startsAt`, `endsAt`, `lastSyncedAt` | Freshness and eligibility |
| `approvalStatus`, `adminDisabled`, `reviewNote`, `reviewedBy`, `reviewedAt` | MCOM moderation |
| `subIdTemplate` or attribution metadata | Define click attribution without personal data |

Keep click and action records in separate tables. Click reports are aggregates;
they are not an event-level log for each MCOM shopper. MCOM can retain its own
click ledger, then reconcile aggregate/action reports using its `subId`,
merchant/coupon identifiers, and dates where the API provides them.

## MCOM API and UI surface to implement

Takeads does not supply these MCOM routes. A typical implementation would add:

| MCOM surface | Responsibility |
|---|---|
| `POST /api/v1/admin/takeads/sync` | Securely trigger or enqueue catalog/coupon sync |
| `GET /api/v1/admin/takeads/candidates` | List imported entries for review |
| `PATCH /api/v1/admin/takeads/candidates/:id/approve` | Approve a candidate |
| `PATCH /api/v1/admin/takeads/candidates/:id/reject` | Reject with optional reason |
| `PATCH /api/v1/admin/takeads/candidates/:id/disable` | Remove an approved record from public display |
| `GET /api/v1/takeads/offers` | Return only publishable approved records |
| `GET /api/v1/takeads/offers/:id/click` | Record MCOM click and redirect |
| Scheduled internal job | Poll and upsert action/click reports |
| Admin/business analytics UI | Display clicks, actions, status, revenue, currency, and date filters |

Protect admin routes with the existing MCOM admin authorization. Public routes
must enforce approval and active/date checks on the server, not merely hide
unapproved entries in the UI.

## Product and Admin Dashboard requirements

The API integration is only one part of the feature. MCOM Mall remains the
marketplace and remains responsible for deciding what customers see. Takeads
should be an additional source of external affiliate opportunities, not a
replacement for MCOM Mall's marketplace, local-business submissions, or
approval process.

### Integration architecture

```text
Takeads API
  merchants · eligible links · coupons · reporting
              │ server-to-server
              ▼
MCOM backend integration service
  authentication · mapping · sync · attribution · reporting imports
              │
              ▼
MCOM database
  source records · admin presentation · approval · publication · analytics
       │                                     │
       ▼                                     ▼
Admin Dashboard                         MCOM Marketplace
review · configure · publish            approved offers only
```

The marketplace frontend must call MCOM APIs, not Takeads directly. The
backend should synchronise and persist Takeads data so customer page loads do
not depend on Takeads availability. Preserve each record's Takeads source and
external IDs so MCOM can refresh and reconcile it.

### Connection settings and launch checks

The backend integration settings should show:

- Connection status and enabled capabilities.
- The configured API base URL (normally `https://api.takeads.com`).
- Whether platform and account reporting credentials are present, without
  displaying their values.
- Last successful synchronization time and last error.
- Counts and timestamps for merchant, coupon, and report synchronizations.

Credentials belong in server-side environment configuration or a secrets
manager. The Takeads specification defines separate bearer credentials for
the Monetize API and Stats API; one key may not authorize every operation.

Before production, confirm with Takeads that the registered MCOM Mall platform
and domain are approved for the intended integration, that the keys belong to
that platform/account, and that the required endpoints and merchant
programmes are available. Platform approval requirements, available products,
and eligibility are account/onboarding matters; they are not established by
the OpenAPI endpoint definitions alone.

### Proposed Admin Dashboard area

Add a dedicated **Takeads Integration** area within the existing MCOM Admin
Dashboard. A proposed navigation structure is:

- Overview
- Merchants
- Affiliate programmes / campaigns (only to the extent data is available)
- Coupons and deals
- Imported offers
- Review and approval
- Performance reports
- Integration settings

The overview can show connection state, last successful sync, number of
merchants/coupons imported, pending and published offer counts, MCOM
impressions and outbound clicks, Takeads-reported clicks and actions, and
commission split by status where the API supplies those values. Label each
metric by its source. A click is not a sale, an action may still be pending or
canceled, and reported commission is not necessarily paid commission.

#### Merchant review

Provide a searchable merchant list with available source metadata, such as
name, logo, domains, country codes, category, active/deeplink flags, currency,
commission metadata, and last update. Allow an admin to map a merchant to an
MCOM category and mark it suitable for consideration, rejected, or inactive.
Opening a merchant should show any relevant campaign/programme information
actually supplied for the account.

A merchant in the directory is not a guarantee that every product or
promotion from it can be advertised. Verify programme availability, terms,
country restrictions, and account eligibility before publishing an offer.

#### Programme/campaign review

Where programme or campaign data is accessible, display its merchant,
identifier/name, available market, status, commission/compensation details,
and applicable conditions. Marking one suitable for consideration must not
automatically publish an offer.

**API limitation:** The published specification marks
`GET /v1/product/monetize-api/v2/program` as deprecated and directs users to
the merchant endpoint. The merchant response includes campaign and commission
metadata, but do not assume it exposes every programme term or that every
Takeads account can retrieve the same data. Verify the current supported
source with Takeads before making this screen a launch dependency.

#### Imported offer management

An admin should be able to review imported coupons or prepared product
promotions and control the MCOM presentation:

- Assign an MCOM Mall category and offer type.
- Set an MCOM display title and presentation description.
- Choose an image only where its usage is permitted.
- Add a campaign label and choose marketplace placements.
- Set MCOM publication scheduling and expiry where applicable.
- Preview the customer-facing card/detail page.
- Approve, reject, pause, re-enable, or withdraw the record.

Keep the original Takeads source fields and terms available for audit. Admin
may edit MCOM presentation copy, but must not invent a discount/code, alter
the merchant's actual terms or destination, or imply an unsupported offer.
Changes to material source terms should trigger re-review. Retain paused,
expired, rejected, and withdrawn records for reporting and audit history.

#### Suggested moderation lifecycle

1. **Imported:** saved from Takeads or prepared by an MCOM admin.
2. **Pending review:** not publicly visible; awaiting admin review.
3. **Approved:** approved for MCOM use, but not necessarily published.
4. **Published:** visible on the marketplace while all availability checks
   pass.
5. **Paused / expired / withdrawn:** not promoted; historical record retained.
6. **Rejected:** not publishable unless deliberately resubmitted for review.

Approval and publication should be distinct controls. Public visibility must
require an approved and published/enabled MCOM record, current upstream
eligibility, and valid coupon dates where relevant.

## Marketplace and customer experience

MCOM Mall should offer one organised customer experience while clearly
distinguishing local/business offers from external affiliate offers. Do not
make an external merchant's product appear to be sold, stocked, fulfilled, or
delivered by MCOM Mall.

Possible marketplace sections include featured offers, national/external
brand promotions, local business offers, and deals/coupons. Customers should
be able to search or filter by offer source/type as product design allows.
Useful labels include:

| Label | Meaning |
|---|---|
| Local Business | Submitted or supplied by an MCOM Mall business |
| National Brand / External Offer | Promotion from an external merchant |
| Affiliate Offer | MCOM Mall may earn commission from a qualifying action |
| Coupon / Deal | Coupon or promotion supplied by an eligible merchant |
| Partner Offer | Promotion supplied through an approved partner arrangement |

### External offer detail and coupon presentation

An external offer detail page should identify the merchant and offer type,
describe how the customer will leave MCOM Mall to visit the merchant, and show
only source-supported terms. A coupon view may show the code, dates, and
conditions if supplied and current. Do not invent a discount, code, expiry,
price, stock state, or product detail.

Use an affiliate disclosure, subject to MCOM's legal/compliance review. For
example:

> MCOM Mall may earn a commission if you make a qualifying purchase through
> this link. Your purchase is completed with the external merchant and is
> subject to that merchant's terms.

The CTA must use a valid resolved affiliate tracking URL, not a plain
destination URL, when the offer is intended to be monetized and resolution
succeeded. If the link is missing, expired, or the offer is no longer
available, disable the CTA and show an unavailable/expired state.

### Customer click journey

1. The customer discovers an approved, published offer in MCOM Mall.
2. The offer detail page explains the merchant, source, applicable terms, and
   affiliate relationship.
3. On CTA selection, MCOM validates current publication/availability and
   records an MCOM outbound click.
4. MCOM redirects the customer to the stored Takeads tracking URL.
5. The customer visits the external merchant, which handles its own product
   information, checkout, payment, order processing, and delivery.
6. Takeads reports eligible click and action activity to the publisher
   account.
7. MCOM reconciles those reports; it does not treat the click as a sale or a
   pending action as confirmed revenue.

## Product-feed limitations and content rights

Do not assume Takeads supplies a complete catalogue of individual products
with SKUs, current prices, stock quantities, descriptions, and product images.
The documented endpoints provide a merchant directory, affiliate-link
resolution, coupons, and reporting. Resolving a product destination URL
confirms whether Takeads can produce a tracking link; it does not itself
provide all product content needed for an MCOM listing.

| Content needed | Source / handling |
|---|---|
| Merchant directory | Takeads merchant endpoint, subject to account availability |
| Coupons and deals | Takeads coupon endpoints, subject to account availability |
| Individual product promotion | An eligible destination URL, successful link resolution, and separately authorised product display data |
| MCOM presentation | Created/configured by MCOM Admin |

Use product copy, images, prices, and other content only from a source MCOM
is authorised to use. Preserve original terms and source metadata and retain
the source of display images.

## Complete admin-to-customer workflow

For a product promotion, an end-to-end workflow could be:

1. Admin searches the synced merchant directory.
2. Admin checks merchant eligibility and available programme/campaign
   details.
3. Admin selects an eligible coupon/deal or supplies an authorised product
   destination URL.
4. The backend calls the appropriate coupon or link-resolution endpoint and
   saves the response as a pending MCOM candidate.
5. Admin selects category, title, presentation description, image, offer
   type, campaign label, placement, and schedule.
6. Admin previews the listing and checks source terms and affiliate link.
7. Admin approves and publishes it.
8. The marketplace shows it only while MCOM approval/publication and
   upstream availability checks pass.
9. Admin monitors MCOM and Takeads metrics separately.

Source information to preserve includes Takeads merchant/programme/coupon
identifiers, original destination, resolved tracking URL, coupon terms and
dates, restrictions, and source update time. MCOM-controlled presentation
includes category, display title and copy, campaign label, placement, display
order, and publication state.

## Analytics and reconciliation requirements

Track two complementary views:

1. **MCOM events:** offer impressions (if implemented), offer page views, and
   outbound clicks, including MCOM offer, campaign, placement, and source.
2. **Takeads reports:** daily click aggregates and action records, including
   their source statuses, amounts, currency, identifiers, and update times.

Show MCOM-recorded clicks separately from Takeads clicks; they may differ due
to timing, attribution, filtering, or tracking behavior. Attribute MCOM-owned
events to offer/campaign/placement. Use a valid Takeads `subId` to associate
tracked activity with an MCOM attribution value where the API supports it.
The click endpoint returns aggregates, not individual MCOM shopper click
events, so retain MCOM's own click ledger where event-level analysis is
needed.

The report UI should support date range and grouping/filtering by merchant,
offer where mapping is possible, campaign, placement, and action status.
Display pending, confirmed, canceled, and settled statuses distinctly; show
order amount, publisher revenue, currency, and `advertiserPaid` as separate
fields. Do not equate confirmed action with advertiser payment unless the
reported payment flag also supports that conclusion. Takeads action records
do not provide customer identity; do not promise shopper-level purchase
analytics.

## Synchronization and availability behavior

- Support scheduled sync and an authorized manual sync from Admin.
- Upsert by provider and stable external IDs; avoid duplicate merchants or
  coupons.
- Store last-success time and an explicit error/status for each sync.
- Use pagination and incremental update filters where available.
- Preserve existing records if an upstream request fails; surface the failure
  rather than silently clearing data.
- Detect deactivated merchants, changed source terms, expired coupons, and
  unresolved links. Flag material changes for review and stop publishing
  unavailable content.
- Retain withdrawn/expired records and reporting history instead of deleting
  them.
- Refresh cached records and tracking links according to Takeads guidance and
  account terms; do not assume a returned tracking link has an indefinite
  lifetime.

## Local businesses and MCOM Rewards

The Takeads integration must not replace or disrupt existing local business
products, services, partner offers, submissions, or moderation. It adds a
second source of external offers to the marketplace:

| Source | Examples | Responsibility |
|---|---|---|
| MCOM/local businesses | Products, services, packages, excess stock, capacity, partner offers | Business supplies the offer; MCOM reviews and presents it |
| Takeads/external merchants | Eligible merchants, affiliate-linked promotions, coupons/deals | Takeads provides affiliate infrastructure; MCOM selects and presents offers |

Customers may discover both in one marketplace, with labels and source
filters that prevent confusion about seller and fulfilment responsibility.
For example, a local barber fulfils their own service, while an external
retailer handles its own checkout and delivery.

Selected external offers may also be considered for MCOM Rewards campaigns,
but this is a separate integration and business decision. Takeads supplies
affiliate tracking/reporting; MCOM Mall manages the marketplace; MCOM Rewards
manages points, stamps, redemption, and customer benefit rules. Do not assume
Takeads commission equals a customer reward or automatically issue rewards
from an affiliate action.

Takeads markets Take Cashback as a publisher cashback/loyalty product, but
its availability and required capabilities are not established by the
endpoints documented in this guide. Confirm whether it is part of the MCOM
account and define the commercial, settlement, and reward rules before
planning that integration.

## Recommended implementation phases

| Phase | Work | Outcome |
|---|---|---|
| 1 | Confirm platform approval, account access, keys, and supported capabilities | Production access and scope understood |
| 2 | Implement backend credentials, health/configuration status, and merchant sync | Admin can inspect eligible merchants |
| 3 | Resolve links and persist attribution metadata | MCOM can create and validate tracking links |
| 4 | Import/search coupons and implement review | Admin can curate approved deals |
| 5 | Build imported-offer management, moderation, and preview | Admin controls presentation and publication |
| 6 | Add marketplace listing/detail/redirect experience | Customers can discover approved offers |
| 7 | Record MCOM impressions/clicks and import Takeads reports | Admin can compare platform and provider results |
| 8 | Assess MCOM Rewards or Take Cashback separately | Loyalty work proceeds only after access and rules are confirmed |

## Questions to confirm with Takeads before production

1. Is the registered MCOM Mall platform/domain approved for production API
   integration?
2. Which credentials have been issued: platform public key, account public
   key, or both, and what exact permissions do they provide?
3. Which merchants, programmes/campaigns, and UK markets are available to
   this publisher account?
4. What current endpoint should be used for programme eligibility and terms,
   given the documented programs endpoint is deprecated?
5. Are coupon and recommended-coupon endpoints enabled for the account?
6. Is Take Cashback included or a separate product/commercial arrangement?
7. What are the programme-specific restrictions on offer presentation,
   search marketing, incentives, coupon use, and affiliate disclosures?
8. What are the reporting delay, action correction, commission validation,
   and payment processes?
9. Are there rate limits, tracking-link expiry rules, or additional attribution
   requirements relevant to the intended volume?

## Stakeholder summary

Takeads is an additional source of external merchants, eligible affiliate
opportunities, coupons, tracking links, and performance reports. It does not
take over MCOM Mall, provide a guaranteed complete product catalogue, own
merchant inventory, or handle the external merchant's checkout and delivery.

MCOM Mall's backend connects to Takeads and stores the returned data. MCOM
Admin decides which opportunities to accept, how to categorise and describe
them, where to place them, and when they are approved and published. Customers
discover local business offers and approved external offers within one
organised marketplace, with clear source labels and affiliate disclosure.
When they follow an external offer, they complete the purchase with the
merchant. MCOM records its own engagement, imports Takeads click/action
reports, and distinguishes clicks, actions, validated commission, and payment.

The goal is to expand MCOM Mall's available offers while keeping its Admin
Dashboard, approval process, local-business experience, and customer
marketplace under MCOM's control.

## Operational and attribution notes

- Keep credentials in the backend's secret manager/environment, and redact
  authorization headers from logs.
- Apply timeouts, bounded retries with backoff for transient errors, and
  explicit handling for `401`, `403`, rate limiting, and server failures.
- Paginate all catalog and report endpoints; do not assume one response is the
  full dataset.
- Use `updatedAtFrom` watermarks for incremental sync/report polling, while
  allowing an overlap window for late updates.
- Preserve upstream statuses and currency. Do not label reported commission as
  paid earnings unless the business rule also checks the relevant action
  status and payment state.
- Make the storefront resilient to expired coupons, removed merchants, and
  unresolved URLs by unpublishing or disabling affected records.
- Verify with Takeads which merchants/programs are available to the MCOM
  account and clarify attribution, reporting delay, and publisher policies
  before launch.

## Source documentation

- [Takeads Swagger/OpenAPI specification](https://docs.takeads.com/)
- [Takeads developer site](https://developers.takeads.com/)
- Existing MCOM Awin promotional-offers implementation:
  [`apps/mcom_mallAPI/docs/promotional-offers.md`](apps/mcom_mallAPI/docs/promotional-offers.md)
- Existing MCOM catalog approval workflow:
  [`apps/mcom_mallAPI/docs/catalog-approval-workflow.md`](apps/mcom_mallAPI/docs/catalog-approval-workflow.md)
