# MCOM Mall — Partner Instrument Runbook

This runbook covers the partner-issued gift card / voucher / coupon surface
used by MCOM Rewards. It is additive to `MCOM_REWARDS_MALL_INTEGRATION.md`.

## Feature flags

| Variable | Default | Purpose |
|:--|:--:|:--|
| `MCOM_REWARDS_MESH_ENABLED` | `true` (existing) | Master switch for the Rewards integration. `false` disables every partner feature below with `503 FEATURE_DISABLED`. |
| `MALL_PARTNER_TEMPLATES_ENABLED` | `false` | Template discovery endpoints and template-aware instrument creation. |
| `MALL_PARTNER_SCOPED_INSTRUMENTS_ENABLED` | `false` | Scope persistence/enforcement (coupons, gift cards, vouchers, bookings). |
| `MALL_PARTNER_GLOBAL_CATALOG_ENABLED` | `false` | Global catalogue browse for platform callers. |
| `MALL_PARTNER_RATE_LIMIT_PER_MINUTE` | `120` | Best-effort per-caller/route limit on partner endpoints. |
| `MCOM_PLATFORM_CALLERS` | empty | Optional comma-separated caller clientIds treated as platform/admin. A token with `role=admin`, `role=super_admin`, or `platformAdmin=true` is also treated as platform. Business callers should carry a `businessId` claim. |

Scope enforcement is always applied when an `instrument_scopes` row exists,
regardless of the flag. Rows are only written when the flag is enabled, so
legacy instruments keep `NO_SCOPE` behaviour.

A copy-ready example lives in `docs/PARTNER_INSTRUMENTS_ENV.example`.

## How to inspect an instrument

```bash
# Service-to-service (verse token with mall:read)
GET /api/v1/partner/instruments/gift-cards/:code
GET /api/v1/partner/instruments/vouchers/:code
GET /api/v1/partner/instruments/coupons/:code
```

The response includes `status`, `balance`, `expiry`, `issuanceId`,
`businessId`, and the resolved `scope`.

Direct SQL:

```sql
SELECT * FROM instrument_scopes
WHERE instrument_type = 'VOUCHER' AND instrument_id = '<id>';

SELECT code, issuance_id, source_app, business_id, balance, status
FROM vouchers WHERE issuance_id = '<rewards-issuance-id>';
```

## How to revoke an instrument

```bash
POST /api/v1/partner/instruments/gift-cards/:code/revoke
POST /api/v1/partner/instruments/vouchers/:code/revoke
POST /api/v1/partner/instruments/coupons/:code/revoke
Body: { "note": "optional reason" }
```

- Unused balance is zeroed and the instrument is disabled.
- `409 CODE_ALREADY_CONSUMED` when there is nothing left to revoke.
- A revocation callback is queued for Rewards (best-effort, retried).
- Manual business redemption (`POST /business/vouchers/redeem/manual`,
  `POST /business/coupons/redeem/manual`) emits the same consumption event.

## How to debug a failed Rewards callback

1. Inspect the outbox:

```sql
SELECT id, issuance_id, operation, status, attempts, next_attempt_at, last_error
FROM partner_redemption_outbox
ORDER BY created_at DESC
LIMIT 50;
```

2. `status`: `PENDING` → `FAILED` (retrying) → `SENT` or `DEAD` (after 8
   attempts). `last_error` contains the peer error (never a token).
3. Force a retry by setting `next_attempt_at = now()` on a `FAILED` row. The
   processor runs every 30 seconds.
4. Requeue a `DEAD` row only after the peer is healthy:

```sql
UPDATE partner_redemption_outbox
SET status = 'PENDING', attempts = 0, next_attempt_at = now()
WHERE id = '<outbox-id>';
```

5. Check the Rewards peer URL and token configuration:
   `MCOM_SOLUTIONS_URL`, `MCOM_CLIENT_ID`, `MCOM_CLIENT_SECRET`,
   `MCOM_REWARDS_CLIENT_ID`, and the `rewards:issue` scope on `mcom-mall`.

Callbacks are idempotent on `(operation, issuanceId, code)` through the unique
`idempotency_key` index, so a retry can never double-redeem.

## How to replay idempotent fulfilment

Replaying `POST /partner/instruments/{kind}` with the same `issuanceId`
returns the original `{ type, id, code, ... }` with `200` (new instruments
return `201`). Reusing the same `code` with a different `issuanceId` returns
`409 CODE_ALREADY_USED`.

## Scope model quick reference

| Mode | Business | Meaning |
|:--|:--:|:--|
| `ALL` | yes | All items of that business |
| `ALL` | no | All of Mall (platform callers only) |
| `LISTINGS` | optional | All items inside the selected listings |
| `ITEMS` | optional | Only the selected product/service ids |
| `NO_SCOPE` | n/a | Legacy unrestricted behaviour |

Scoped gift cards/vouchers exclude shipping from `eligiblePayable`. Legacy
`NO_SCOPE` instruments keep the existing items + shipping behaviour.

## Error codes

| Code | HTTP | Meaning |
|:--|:--:|:--|
| `FEATURE_DISABLED` | 503 | Flag/master switch is off |
| `CROSS_TENANT_SCOPE` | 403 | Business caller attempted an all-Mall/foreign scope |
| `TEMPLATE_NOT_OWNED` | 403 | Template belongs to another business |
| `TEMPLATE_INACTIVE` | 422 | Template is disabled/archived |
| `SCOPE_EMPTY` | 422 | Scope arrays empty |
| `SCOPE_EXCEEDS_TEMPLATE` | 422 | Instrument scope broader than template |
| `SCOPE_INVALID` | 422 | Id missing, unpublished, or archived |
| `SCOPE_NO_ELIGIBLE_LINES` | 422 | No cart/booking line matches the scope |
| `AMOUNT_OUT_OF_RANGE` | 422 | Amount violates template fixed/custom rules |
| `CODE_ALREADY_USED` | 409 | Code reused with a different issuance |
| `CODE_ALREADY_CONSUMED` | 409 | Revoke attempted on an exhausted instrument |
