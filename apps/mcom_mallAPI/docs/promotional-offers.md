# Promotional Offers & Awin Affiliate Catalogue

This module adds MCOM-managed external products and services on top of the
existing merchant catalogue. It does **not** replace or modify merchant-owned
`Products` / `services` records.

## Database

Run the migration:

```bash
pnpm --filter @mcommall/api migration:run
```

Tables:

- `promotional_offers` — admin-created external product/service/offer records.
- `promotional_offer_businesses` — allow-list when `availability = 'selected'`.
- `business_promotional_offers` — business storefront imports (read-only for the business).
- `affiliate_clicks` — internal click ledger keyed by a unique `clickRef`.
- `affiliate_transactions` — Awin transactions reconciled back to a business.

## Environment

```env
# Awin publisher account (central MCOM account)
AWIN_PUBLISHER_ID=123456
AWIN_API_TOKEN=your-awin-api-token

# Optional overrides
AWIN_API_BASE=https://api.awin.com
AWIN_DEEPLINK_BASE=https://www.awin1.com/cread.php
AFFILIATE_IP_HASH_SALT=change-me
```

When Awin is not configured, clicks are still recorded and the advertiser's
destination URL is used with an MCOM reference appended:

```
https://advertiser.example.com/product/123
  ?ref=<businessId>
  &mcom_ref=mcom-<businessId>-<random>
  &mcom_business_id=<businessId>
```

This means the business reference is attached even before the Awin publisher
account is connected. When Awin is configured, MCOM builds an Awin deep link:

```
https://www.awin1.com/cread.php
  ?awinmid={offer.advertiserId}
  &awinaffid={AWIN_PUBLISHER_ID}
  &clickref={business-specific-reference}
  &ued={offer.destinationUrl}
```

The `clickref` always includes the business UUID (or `platform` for marketplace
clicks), e.g. `mcom-<businessId>-<random>`. No personal data is included.

## Endpoints

Public:

- `GET /api/v1/promotional-offers/public` — returns only offers claimed by a
  live business. Each row represents one business claim, so the same offer can
  appear under multiple businesses. Each row includes `businessId` and
  `businessName`; that business is shown as the seller and receives the click
  attribution.
- `GET /api/v1/promotional-offers/public/:id`
- `GET /api/v1/promotional-offers/click/:id?businessId=&source=` — records a
  click then 302-redirects to the Awin tracking link.

Business (JWT):

- `GET /api/v1/promotional-offers/catalog?offeringType=product|service`
- `POST /api/v1/promotional-offers/:id/import`
- `DELETE /api/v1/promotional-offers/:id/import`
- `GET /api/v1/promotional-offers/performance`

Admin:

- `GET|POST /api/v1/admin/promotional-offers`
- `GET|PATCH|DELETE /api/v1/admin/promotional-offers/:id`
- `GET /api/v1/admin/promotional-offers/stats`
- `POST /api/v1/admin/promotional-offers/affiliate/sync`
- `GET /api/v1/admin/affiliate/summary`
- `GET /api/v1/admin/affiliate/clicks`
- `GET /api/v1/admin/affiliate/transactions`
- `GET|POST /api/v1/admin/promotional-campaigns`
- `GET|PATCH|DELETE /api/v1/admin/promotional-campaigns/:id`
- `GET /api/v1/admin/promotional-campaigns/stats`

Business campaigns:

- `GET /api/v1/promotional-campaigns/mine`
- `PATCH /api/v1/promotional-campaigns/:id/respond`
- `GET /api/v1/promotional-campaigns/public/:businessId` (accepted campaigns
  for a storefront)

Partnerships:

- `GET /api/v1/partnerships/business/:businessId/partner-offers` — public
  partner-owned products/services promoted by a storefront.

## Business UI

- `/dashboard/promotions` is the unified **Promotions & Partnerships** hub:
  - Available Promotions (accept/decline/withdraw campaign participation)
  - Affiliate Offers (product and service catalogue imports)
  - Business Partnerships (existing partner discovery, requests and links)
- Imported offers and accepted campaigns appear on the business's public
  listing under the **Promotions** tab. Partner-owned offerings appear in the
  **Partner Promotions** section.

## Attribution rules

- Click attribution is recorded independently of Awin, so unmatched or lost
  Awin conversions can still be investigated.
- Storefront clicks carry the business UUID in `clickRef`.
- Marketplace clicks are attributed to `platform`.
- Awin transaction sync runs daily at 03:00 when credentials are present. It
  can also be triggered from **Admin → Affiliate Reporting → Sync from Awin**.
- Pending transactions are never treated as confirmed earnings. Business
  earnings use the offer's `businessCommissionRate` and only approved/amended
  transactions.
