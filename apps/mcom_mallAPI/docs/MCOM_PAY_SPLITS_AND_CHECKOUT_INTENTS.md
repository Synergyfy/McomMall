# MCOM Pay splits + quote-bound checkout intents

This implements the MCOM Payments Partner Guide's **payee splits** (Part G) and
the **webhook backstop** for checkout (Part B4.2/B5).

## Feature flags / config

```env
# Pay marketplace sellers through MCOM Pay payee splits.
# Enabled for the Mall: the buyer pays once and MCOM credits each seller.
MCOM_PAY_SPLITS_ENABLED=true

# Payee id for the Mall's own share (shipping + service commission) when
# splits are enabled. The money is held on a payee payable and paid out by MCOM.
MCOM_PLATFORM_PAYEE_ID=mcom-mall-platform
```

## How splits are calculated

The server re-prices the checkout and builds the **gross entitlement** for each
seller (products, gift-card purchases and bundled service providers) plus the
platform share (shipping + 10% service commission).

`allocateCashSplits()` then allocates the **cash actually charged** across those
payees proportionally with largest-remainder rounding, so the split list always
sums exactly to `amountMinor` (MCOM rejects anything else).

- Buyers using gift cards / vouchers / money vouchers reduce the cash charge;
  the seller keeps the instrument-funded remainder in the local earnings ledger.
- The local `creditEarning` calls subtract the part paid through MCOM Pay, so a
  seller is never paid twice.
- With `MCOM_PAY_SPLITS_ENABLED=false` no splits are sent and local earnings
  behave exactly as before.
- Booking completion skips the Mall's legacy Stripe Connect / PayPal payout
  when the booking's charge used splits, so the provider is not paid twice.
- Refunded bookings reverse only the provider's **local** earnings; MCOM
  reverses the split portion itself.

## Direct purchases (gift cards, vouchers, coupons)

These are single-seller sales, so the seller receives a single MCOM split and
the Mall keeps no commission on the sale. Purchases and reloads both carry the
split. The local `earning_gift_card` / `earning_voucher` credit is reduced by
the split cash; coupon purchases (which had no local earnings credit) simply
receive the split.

## Order compensating refunds

The checkout compensating refund now runs **only when the order transaction
rolled back**. A post-commit side effect (reward commit, email/notification)
can no longer trigger a refund, because the order and seller earnings are
already durable. This removes the need to reverse local earnings in the
compensating path.

Admin order refunds go through:

```http
POST /api/v1/order/:id/refund
Authorization: Bearer <admin JWT>
{ "reason": "Customer requested refund", "restock": true, "cancelBookings": true }
```

The endpoint:

1. calls MCOM Pay `/charges/:id/refund` for the full order total (MCOM reverses
   the payee splits itself);
2. marks the order `CANCELLED` and its payment `refunded`;
3. reverses the seller earning transactions the Mall credited for that order
   (products, gift-card purchases, bundled booking escrow), idempotently;
4. restores tracked product stock when `restock` is not false;
5. cancels bundled service bookings when `cancelBookings` is not false.

It is idempotent: a repeat call returns the already-cancelled order and does
not refund or reverse twice. Full refunds only; partial refunds are rejected.
Consumed customer instruments (gift cards, vouchers, coupons, rewards) are not
re-issued by this endpoint.

## Live policy

- **MCOM processing fee:** payee-pays (MCOM's default 2.9% + 20p is deducted
  from each payee's gross share). Set the app fee to 0 in the Console if the
  Mall should absorb/bill it separately instead.
- **Platform share:** shipping fees and the 10% service-booking commission are
  sent as the `mcom-mall-platform` external payee. Product sellers keep their
  full product share (no Mall commission on products).
- **Instrument-funded remainder:** gift cards, vouchers, money vouchers and
  discounts reduce the cash charge; the seller's remaining entitlement stays in
  the local earnings ledger so the two rails add up to the gross entitlement.

A MCOM Pay charge can have at most 50 payees. Larger carts fall back to the
app-payable model rather than dropping a seller.

## Quote-bound checkout intents

`POST /api/v1/order/payment-intent`

```json
{
  "quote": { "directPurchase": { "productId": "...", "quantity": 1 } },
  "paymentProvider": "stripe",
  "idempotencyKey": "checkout-<attempt>-<amount>-<quote-hash>"
}
```

The endpoint:

1. re-runs the authoritative checkout quote (never trusts a browser amount);
2. computes payee splits when enabled;
3. creates the MCOM Pay charge with `intent: "ORDER"` and the splits;
4. stores the frozen quote, amount, charge id and splits in
   `mcom_payment_intents` before the buyer pays.

Response is `clientSecret` (Stripe) or `orderId` / `approvalUrl` (PayPal), plus
`paymentIntentId`, `chargeId` and `amount`.

`POST /api/v1/order/payment-intent/:id/complete` verifies the charge and creates
the order. It is idempotent: calling it after the normal `/order/checkout` (or
after a webhook completion) returns the same order and never refunds.

## Webhook backstop

`payment.succeeded` / `payment.refunded` still arrive at
`POST /api/v1/payments/mcom/webhook`. When a paid charge has no allocation yet, the handler:

- for a `booking-<id>` reference, emits `MCOM_PAY_BOOKING_PAID`; 
  `BookingPaymentListener` runs the normal booking confirmation (including
  provider earnings) idempotently;
- for a checkout reference / charge id, looks up the intent and emits
  `MCOM_PAY_INTENT_PAID`; `OrderPaymentIntentListener` completes the order from
  the frozen quote.

A failure is re-thrown so Central retries the delivery.

`payment.succeeded` is deduplicated per charge (canonical inbox hash), and every
delivery must atomically claim the inbox row (`processingAt`, 5-minute stale
timeout) before running business handlers. A concurrent duplicate receives 503
so Central retries after the winner commits; this prevents the duplicate from
hitting a uniqueness error and triggering a compensating refund.

Purchase backstops use the `localContext` frozen on the charge at initiation:

| Purpose | Completion |
|---|---|
| `GIFT_CARD`, `GIFT_CARD_RELOAD` | `GiftCardPaymentListener` |
| `VOUCHER`, `VOUCHER_RELOAD` | `VoucherPaymentListener` |
| `COUPON`, `COUPON_RELOAD` | `CouponPaymentListener` |
| `MEMBERSHIP` | `MembershipPaymentListener` |
| `WALLET_TOPUP` | `WalletTopUpPaymentListener` |
| `MONEY_VOUCHER`, `MONEY_VOUCHER_CONTRIBUTION` | `MoneyVoucherPaymentListener` |

The listener uses the **MCOM charge id** as the transaction/idempotency key, so
a replayed webhook returns the existing entitlement instead of issuing twice
and refunding.

## PayPal return

PayPal charges created by `/order/payment-intent` return to
`/payment/paypal/return?purpose=order&paymentIntentId=<id>`. The return page
calls the completion endpoint with PayPal's `token`; the backend verifies the
charge and creates the order.

## Migration

`1799900000006-AddMcomPaymentIntents` adds:

- `mcom_payment_intents` (quote-bound intent, charge id, splits, status);
- `mcom_pay_charges.intent` and `mcom_pay_charges.splits`.

`1799900000007-AddWebhookProcessingClaim` adds
`mcom_pay_webhook_events.processingAt` for the atomic delivery claim.

Run `pnpm migration:run` before deploying.

## Partner read APIs (new guide G5/G6)

The API now proxies MCOM Pay's read-only partner endpoints so admins can
reconcile settlement without leaving the mall:

| Mall route (admin JWT, role `ADMIN`) | MCOM Pay endpoint | Purpose |
|---|---|---|
| `GET /api/v1/admin/payments/mcom/balance` | `GET /app-payments/balance` | App payable, pending payout, available and paid-out balances |
| `GET /api/v1/admin/payments/mcom/charges` | `GET /app-payments/charges` | List this app's charges (`status`, `mcomUserId`, `reference`, `dateFrom`, `dateTo`, `page`, `limit`) |
| `GET /api/v1/admin/payments/mcom/charges/:id/splits` | `GET /app-payments/charges/:id/splits` | Per-payee settlement: `pending` / `credited` / `failed` + `settlementState` |

Card orders should poll the splits route until `settlementState` is `SETTLED`.
A `failed` split does not roll back the payment; MCOM retries it and
`failureReason` explains why (for example a frozen payee wallet).

## Guest card / PayPal buyers

`mcomUserId` is sent whenever the mall account is SSO-linked. If it is absent,
card and PayPal charges still proceed and MCOM records a guest buyer
(Partner Guide B4.1a). Wallet payments always require a linked Central user
because the wallet belongs to that account.

## Split validation

`createCharge` now validates the split contract **before** calling Central:

- every `amountMinor` is a positive integer string;
- `mcom_user` splits carry `payeeUserId`, `external` splits carry
  `payeeExternalId`;
- no duplicate payees, at most 50 splits;
- the splits sum exactly to the charge amount (otherwise `422 SPLIT_SUM_MISMATCH`).

Minor units are converted with `BigInt` from a 2-dp string, never by float
multiplication, so a penny can never be created or lost in transport.

## Tests

- `payment-splits.util.spec.ts` covers rounding, proportional reduction,
  platform surplus and the 50-payee cap.
- `pnpm typecheck` and the payments/order/booking Jest suites pass.
