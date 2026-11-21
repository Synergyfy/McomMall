# Profile Update Endpoint (Central → Mall)

Central is the source of truth for user and business profiles. When a profile
changes, Central sends a small signed signal to the Mall; the Mall then pulls the
canonical record back over the service mesh and mirrors it onto its local
`users` / `businesses` rows.

## Endpoint to register in MCOM Console

```
https://api.mall.mcom.com/api/v1/webhook/profile-updated
```

(`/api/v1/webhooks/profile-updated` is accepted as an alias.)

Console → Ecosystem app → **Profile Update Endpoint**. Saving the endpoint
provisions `central:read`, the `mcom-central` audience and the mesh ingress
grant automatically.

## Flow

```
1. Admin edits a profile in Central.
2. Central POSTs { event: "profile.updated", data: { userId, eventId, occurredAt } }
   with X-Mcom-Webhook-Signature.
3. Mall verifies the HMAC over the raw body.
4. Mall dedupes on data.eventId (at-least-once delivery).
5. Mall mints an RS256 service token: audience "mcom-central", scope "central:read".
6. Mall calls GET {MCOM_SOLUTIONS_URL}/api/v1/ecosystem/profiles/{userId}
   directly (no Central hop in the data path).
7. Mall creates/links the local user by the immutable Central userId, then
   diffs the person + business profile onto the local rows.
```

## Request contract

```http
POST /api/v1/webhook/profile-updated
Content-Type: application/json
X-Mcom-Webhook-Signature: sha256=<hex>
```

```json
{
  "event": "profile.updated",
  "platform": "mcom-mall",
  "timestamp": "2026-11-20T10:15:00.000Z",
  "data": {
    "eventId": "4f1c2e8a-8f2b-4a1e-9c3d-2b7e6a1d9f40",
    "occurredAt": "2026-11-20T10:15:00.000Z",
    "userId": "usr_123"
  }
}
```

Both `sha256=<hex>` and bare-hex signature headers are accepted. The Mall
refuses to process any delivery when no webhook secret is configured.

Supported events: `profile.updated`, `profile.created` (same pull path).
Anything else is acknowledged with `200` and ignored so Central does not retry.

## Responses

| Status | Meaning |
|:--|:--|
| `200` | Applied, duplicate delivery, or permanently skipped (role not served / unknown user). |
| `400` | Malformed payload (missing `event` or `data.userId`). |
| `401` | Missing / invalid signature. |
| `503` | Transient pull failure — **Central should retry** (exponential backoff). |

## Environment

```bash
# Base URL of the MCOM Central control plane (token minting + profile pull)
MCOM_SOLUTIONS_URL=https://auth.mcomsolutions.com

# This app's Console credentials (used to mint the central:read token)
MCOM_CLIENT_ID=mcom-mall
MCOM_CLIENT_SECRET=cs_live_...

# Secret Central uses to sign the delivery.
# Falls back to MCOM_WEBHOOK_SECRET when not set.
MCOM_PROFILE_WEBHOOK_SECRET=wh_...

# Optional rollout bridge: when the B2B profile endpoint is not live yet,
# read the profile from the legacy HMAC data API instead. Default: off.
MCOM_PROFILE_SYNC_HMAC_FALLBACK=false
```

## Database

The delivery inbox is `mcom_profile_sync_events` (unique `eventId`, status,
attempts, last error, raw payload). Apply the migration:

```bash
pnpm --filter @mcommall/api migration:run
```

## Local test

```bash
SECRET="$(grep '^MCOM_WEBHOOK_SECRET=' .env | cut -d= -f2-)"
BODY='{"event":"profile.updated","data":{"userId":"usr_123","eventId":"evt_local_1"}}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | sed 's/^.* //')"

curl -i -X POST http://localhost:3000/api/v1/webhook/profile-updated \
  -H 'Content-Type: application/json' \
  -H "X-Mcom-Webhook-Signature: sha256=$SIG" \
  --data-raw "$BODY"
```

Expected: `200` with `{ "event": "profile.updated", "userId": "usr_123", "duplicate": false, "synced": { ... } }`.

Re-running the same body returns `duplicate: true` and does not re-pull.

## Replay / inspection

```sql
SELECT "eventId", "centralUserId", status, attempts, "lastError", "updated_at"
FROM mcom_profile_sync_events
ORDER BY "updated_at" DESC
LIMIT 50;
```

Rows left in `failed` can be replayed by re-delivering the event; the inbox
retries in place and increments `attempts`.
