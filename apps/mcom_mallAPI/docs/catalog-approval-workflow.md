# Catalog approval workflow

Merchant-authored catalog items are hidden from shoppers until an admin
approves them. Approval and admin delisting are two separate switches:

| Column           | Meaning                                                        |
| ---------------- | -------------------------------------------------------------- |
| `approvalStatus` | `pending` / `approved` / `rejected` — admin sign-off            |
| `adminDisabled`  | `true` when an admin has delisted an item from the public catalog |
| `reviewNote`     | Optional admin message shown to the owner                       |
| `reviewedBy`     | Admin user who last approved/rejected                           |
| `reviewedAt`     | When the last approval/rejection happened                       |

Items are publicly visible only when **all** of the following are true:

- `approvalStatus = 'approved'`
- `adminDisabled = false`
- the item's own merchant-controlled state is live
  (product: `productStatus = 'published'` and `visibility = 'public'`;
  service: `status = 'published'` and `isActive = true`;
  templates/vouchers/coupons/offers: enabled/active flag).

Owners and admins can always read their own/all items through the existing
owner/admin endpoints, regardless of approval state.

## Covered resources

- `Products` (products)
- `services` (services)
- `gift_card_templates` (gift-card templates)
- `voucher_products` (voucher products)
- `coupon_products` (legacy coupon products)
- `coupons` (business coupon templates)
- `offers` (loyalty offers)
- `offers` with `isTimeBonus = true` (time bonuses)

Rows that existed before the workflow was introduced were backfilled as
`approved`.

## Admin endpoints

All routes require an `admin` role.

```
GET   /api/v1/admin/moderation/stats
GET   /api/v1/admin/moderation/:resource
PATCH /api/v1/admin/moderation/:resource/:id/approve
PATCH /api/v1/admin/moderation/:resource/:id/reject
PATCH /api/v1/admin/moderation/:resource/:id/delist
PATCH /api/v1/admin/moderation/:resource/:id/republish
```

`:resource` is one of:

```
products
services
gift-card-templates
voucher-products
coupon-products
coupons
offers
time-bonuses
```

`reject` accepts an optional body:

```json
{ "reviewNote": "Add clearer images before this can go live." }
```

The existing product/service admin actions keep working:

- `PATCH /api/v1/admin/products/:id/approve`
- `PATCH /api/v1/admin/products/:id/reject`
- `PATCH /api/v1/admin/products/:id/deactivate` — delist
- `PATCH /api/v1/admin/products/:id/activate` — republish **and** approve
- the same four routes under `/api/v1/admin/services`

## Owner behaviour

- Creating any covered item stores `approvalStatus = 'pending'`.
- Editing a `rejected` item automatically puts it back into `pending`.
- Owner update payloads can never write `approvalStatus`, `reviewNote`,
  `reviewedBy`, `reviewedAt` or `adminDisabled`; those fields are stripped
  server-side.
- Admin-created services and admin-authored coupons/offers/voucher products
  are approved immediately.

## Enforcement

Public product/service lists and details, search, marketplace, cart,
wishlist, checkout, orders, bookings, reviews, coupon validation/redemption,
gift-card and voucher purchases/reloads, offer redemption and time-bonus
activation all check approval state. Delisting removes an item from those
surfaces and prevents new purchases/bookings, while existing orders, bookings,
issued vouchers/gift cards and purchased coupons remain accessible to their
owners.
