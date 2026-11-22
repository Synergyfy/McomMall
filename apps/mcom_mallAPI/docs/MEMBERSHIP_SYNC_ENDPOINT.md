# Membership Update Endpoint (Central → Mall)

When a business buys an MCOM Central membership plan that **includes MCOM Mall**,
Central provisions the matching Mall package and POSTs a signed
`membership.updated` event. The Mall maps that package onto a local plan
variant and grants (or revokes) the business's access until the membership
expiry Central sent.

Central owns the billing relationship. The Mall never charges for a bundled
membership and never auto-renews it locally.

## Endpoint to register in MCOM Console

```
https://api.mall.mcom.com/api/v1/webhooks/membership-updated
```

(`/api/v1/webhook/membership-updated` is accepted as an alias.)

Console → **the Mall app → Configuration → Membership Synchronization** → paste
the URL and save. Central will then deliver membership events for plans that
bundle this app. Apps excluded from the purchased plan never receive the event.

## Flow

```
1. Business buys a Central membership (e.g. Gold) that bundles MCOM Mall.
2. Central provisions the Mall package and POSTs membership.updated with
   X-Mcom-Webhook-Signature.
3. Mall verifies the HMAC over the raw request body.
4. Mall dedupes on data.eventId (at-least-once delivery).
5. Mall resolves the local user by data.userId. If the business has never
   signed into the Mall, the canonical profile is pulled over the service mesh
   and a local account is provisioned first.
6. Mall maps the package (data.package.externalPlanId / packageName) to a local
   plan_variants row. See "Plan mapping" below.
7. status active  → membership row is activated until membership.expiresAt.
   status expired / cancelled / inactive → membership row is revoked.
8. The subscription cache is cleared so the next request sees the new access
   immediately.
```

## Request contract

```http
POST /api/v1/webhooks/membership-updated
Content-Type: application/json
X-Mcom-Webhook-Signature: sha256=<hex>
```

```json
{
  "event": "membership.updated",
  "platform": "mcom-mall",
  "timestamp": "2026-11-22T10:15:00.000Z",
  "data": {
    "eventId": "8f2c1e9a-3b4d-4c5e-9f6a-1d2b3c4e5f60",
    "occurredAt": "2026-11-22T10:15:00.000Z",
    "userId": "usr_123",
    "businessId": "biz_123",
    "membership": {
      "planId": "plan_gold",
      "planName": "Gold",
      "tier": "Pro+",
      "level": "Gold",
      "status": "active",
      "billingCycle": "Annually",
      "amount": 249,
      "currency": "GBP",
      "startsAt": null,
      "expiresAt": "2027-11-22T00:00:00.000Z"
    },
    "package": {
      "platform": "MCOM Mall",
      "packageName": "Mall Pro+",
      "externalPlanId": "mall-pro-plus",
      "status": "active",
      "limits": { "listings": 500 },
      "expiresAt": "2027-11-22T00:00:00.000Z"
    }
  }
}
```

Both `sha256=<hex>` and bare-hex signature headers are accepted, as is the
`X-Mcom-Signature` alias. The Mall refuses to process any delivery when no
webhook secret is configured.

Supported events: `membership.updated`. Anything else is acknowledged with
`200` and ignored so Central does not retry.

## Plan mapping

Access is granted against a local **plan variant** (the sellable unit:
plan family × tier, e.g. `Gold · Pro+`). Central's package is resolved in this
order (first match wins):

| # | Strategy | Example |
|:--|:--|:--|
| 1 | `MCOM_MEMBERSHIP_PLAN_MAP` env override (JSON) | `{"mall-pro-plus":"<variant-uuid>"}` |
| 2 | `plan_variants.external_plan_id` (case-insensitive) | `mall-pro-plus` |
| 3 | package id is a local variant UUID | `1b0c…` |
| 4 | package id is a local plan id or plan slug | `gold` |
| 5 | `packageName` matches a plan family name | `Gold` |
| 6 | composite text, e.g. `mall-gold-pro-plus` | plan `gold`, tier Pro+ |

When a match lands on a plan family instead of a specific variant, the tier is
inferred from `packageName` / `externalPlanId` / `membership.tier`
(`Pro+` → `PRO_PLUS`, `Pro` → `PRO`, otherwise Standard). A missing tier falls
back to the lowest active tier (Standard).

Set `external_plan_id` on a variant from the admin UI, or via the admin API:

```http
PATCH /api/v1/plans/variants/:variantId
Authorization: Bearer <admin JWT>
Content-Type: application/json

{ "externalPlanId": "mall-pro-plus" }
```

The MCOM Solution connector can also set it when creating a plan by adding
`externalPlanId` to each variant in `POST /api/v1/system/plans`. If it is not
set, the synthesized system-plan response falls back to the local variant UUID,
which strategy 3 resolves.

## Responses

| Status | Meaning |
|:--|:--|
| `200` | Applied (`activated` / `revoked`), duplicate delivery, unsupported event, or permanently skipped (no local user). |
| `400` | Malformed payload (missing `event` or `data.userId`). |
| `401` | Missing / invalid signature. |
| `503` | Transient failure **or unmapped package** — Central retries with backoff, then dead-letters the event for replay once the mapping is fixed. |

A `503` for an unmapped package is intentional: silently acknowledging it
would grant nothing and leave no visible failure. Map the plan and replay from
the Console dead-letter queue.

## Environment

```bash
# Already required by the rest of the Central integration.
MCOM_SOLUTIONS_URL=https://auth.mcomsolutions.com
MCOM_CLIENT_ID=mcom-mall
MCOM_CLIENT_SECRET=cs_live_...

# Secret Central uses to sign the delivery.
# Falls back to MCOM_WEBHOOK_SECRET, then MCOM_HMAC_SECRET.
MCOM_MEMBERSHIP_WEBHOOK_SECRET=wh_...

# Optional explicit mapping when plan ids do not line up.
# Keys are matched against package.externalPlanId and packageName.
# Values are a local variant UUID, or "<plan-slug>:<TIER>".
MCOM_MEMBERSHIP_PLAN_MAP='{"mall-pro-plus":"gold:PRO_PLUS"}'
```

## Database

Apply the migration (adds `plan_variants.external_plan_id` and the
`mcom_membership_sync_events` inbox):

```bash
pnpm --filter @mcommall/api migration:run
```

| Table | Purpose |
|:--|:--|
| `mcom_membership_sync_events` | Durable inbox: unique `eventId`, status, attempts, last error, raw payload. |
| `plan_variants.external_plan_id` | Central → local plan mapping. |

## Local test

```bash
SECRET="$(grep '^MCOM_WEBHOOK_SECRET=' .env | cut -d= -f2-)"
BODY='{"event":"membership.updated","data":{"userId":"usr_123","eventId":"evt_local_1","membership":{"status":"active","expiresAt":"2027-11-22T00:00:00.000Z"},"package":{"packageName":"Mall Pro+","externalPlanId":"mall-pro-plus","status":"active","expiresAt":"2027-11-22T00:00:00.000Z"}}}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | sed 's/^.* //')"

curl -i -X POST http://localhost:3000/api/v1/webhooks/membership-updated \
  -H 'Content-Type: application/json' \
  -H "X-Mcom-Webhook-Signature: sha256=$SIG" \
  --data-raw "$BODY"
```

Expected:

```json
{
  "event": "membership.updated",
  "userId": "usr_123",
  "duplicate": false,
  "applied": {
    "action": "activated",
    "localUserId": "…",
    "planVariantId": "…",
    "expiresAt": "2027-11-22T00:00:00.000Z"
  }
}
```

Re-running the same body returns `duplicate: true` and does not re-apply.

## Replay / inspection

```sql
SELECT "eventId", "centralUserId", "businessId", "externalPlanId",
       status, attempts, "lastError", "updated_at"
FROM mcom_membership_sync_events
ORDER BY "updated_at" DESC
LIMIT 50;
```

Rows left in `failed` can be replayed by re-delivering the event; the inbox
retries in place and increments `attempts`. Rows in `skipped` hit a permanent
condition (no local user could be provisioned) and need manual follow-up.

## What this does **not** do

- It does not create a payment, invoice or wallet debit. Central already
  collected the money.
- It does not enable local auto-renew. Bundled memberships have
  `autoRenew = false`, `nextChargeAt = null` and
  `renewalMethod = central_membership`, so the Mall renewal cron cannot
  double-charge the customer.
- It does not revoke a membership the Mall sold itself. A Central expiry is
  ignored unless the active row is stamped `renewalMethod = central_membership`.
- It does not bypass the Mall's own role checks. Only the membership grant is
  applied; merchant tooling still enforces its normal permissions.
