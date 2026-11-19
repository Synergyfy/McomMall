# MCOM Mall — Central Hub Payments Audit & Remediation Plan

**Date:** 2026-11-17
**Scope:** Every money-in / money-out path in `apps/mcom_mallAPI`, `apps/McomMall` (customer) and `apps/McomMallAdmin` (business/admin), against the *MCOM Payments — Partner Integration Guide* (Wallet + MCOM Pay + Recurring).
**Method:** Static trace of all payment entry points, provider clients, DTOs, entities, webhooks and payment UI. No application code was modified at audit time.

> **Update 2026-11-18:** the hardening items in this report have been implemented. See `MCOM_PAYMENTS_FIXES_APPLIED.md` for the change list, migration, deploy steps and remaining product decisions.

---

## 0. Verdict (TL;DR)

The integration is **real and mostly routed through MCOM Pay**, not a mock. When `MCOM_PAY_ENABLED=true` (the default, and set in `.env`), card, PayPal and wallet purchases are created and verified through Central Hub `/api/v1/app-payments`. The partner HMAC client (`McomPayService`) and wallet client (`McomWalletService`) are correctly shaped after the guide.

**But it is not production-safe yet.** The main problems are not "is Central wired in" — they are:

1. **Authorization/verification gaps** — a paid charge is verified only by *status + amount + currency*. It is never bound to the paying user, the business record, or "not already used". One paid charge can be replayed to complete multiple orders/bookings/memberships.
2. **Money can be taken with no goods** — wallet charges settle at `initiate` time, but stock/order/membership writes happen later with no refund path. Paid orders are left `PENDING` forever because `/order/checkout` never transitions them.
3. **A free-money endpoint** — `POST /digital-value/consumer/:id/fund` mints instrument balance with **no payment verification at all**.
4. **Record-keeping is insufficient** — `mcom_pay_charges` does not store fee/net/paidAt/mcomUserId, the MCOM charge id is not linked to orders/memberships/bookings, webhooks only flip a status, and `recordCharge` silently swallows DB failures.
5. **Legacy direct-provider code is still live** — Stripe/PayPal SDK fallbacks, mall-side Stripe/PayPal webhooks, and mall-owned Stripe/PayPal payouts. The doc says every payment must go through Central.
6. **Frontend is inconsistent and partly fake** — fake card capture into `localStorage`, fake invoices, admin checkout cannot create a payment, PayPal `approvalUrl` is ignored, and admin has no publishable keys configured.

**Bottom line:** keep the current MCOM Pay core, but do a focused hardening pass before go-live. The plan in §9 is ordered so Phase 0/1 removes the money-loss and fraud risks before any cosmetic work.

---

## 1. What "correct" looks like (from the guide)

| Requirement | Guide reference |
|---|---|
| All money collected server-side; amount never from the browser | B1, B1.1 |
| Amounts in integer minor units (pence) | B2 |
| HMAC `X-Mcom-Client-ID` + `X-Mcom-Signature`; `X-Idempotency-Key` on every write | A4, D |
| One idempotency key per **business event**; same key on retries; new key per billing period | D, C1 |
| Verify settlement server-side before releasing goods | B1, B4.2 |
| Stripe → official PaymentElement with Central's publishable key | B1.1 |
| PayPal → official `approvalUrl` redirect / official SDK with **Central's** merchant | B1.1 |
| Wallet → show Central balance; on `422 INSUFFICIENT_BALANCE` offer top-up link | B1.1 |
| Immutable Central ledger; partner keeps its own auditable records | B3, B5 |
| Webhooks are signed, at-least-once, idempotent per `chargeId` | B5 |
| Recurring is the partner's scheduler (Central does not store partner mandates) | Part C |

---

## 2. Current architecture (as implemented)

```
Browser
  │  (only publishable keys / redirect)
  ▼
Next.js apps ──► NestJS API ──► PaymentProviderService ──► McomPayService ──► Central Hub
                                  │  (MCOM Pay default)      /api/v1/app-payments
                                  │
                                  ├──► McomWalletService ──► /api/v1/wallet/partner
                                  │      (credit/refund/balance only)
                                  │
                                  └──► direct Stripe/PayPal SDK
                                         (only when MCOM_PAY_ENABLED=false,
                                          plus always for payouts/webhooks)
```

**Good news — the core wiring exists:**

- `apps/mcom_mallAPI/src/resources/payments/services/mcom-pay.service.ts` — correct HMAC, retries, `X-Idempotency-Key`, 422 mapping, refunds, webhook signature.
- `apps/mcom_mallAPI/src/resources/payments/services/mcom-wallet.service.ts` — balance, transactions, credit (top-ups/refunds), hold/capture (legacy fallback).
- `apps/mcom_mallAPI/src/resources/payments/services/payment-provider.service.ts` — routes create/verify/refund to MCOM Pay when enabled.
- `apps/mcom_mallAPI/src/resources/payments/entities/mcom-pay-charge.entity.ts` + migration `1792000000000-CreateMcomPayCharges.ts` — a local mirror of Central charges.
- MCOM Pay webhook: `POST /api/v1/payments/mcom/webhook`, HMAC verified.
- Env: `MCOM_PAY_ENABLED=true`, `MCOM_WALLET_ENABLED=true`, `MCOM_HMAC_SECRET`, `MCOM_WEBHOOK_SECRET` are set.

**Bad news — the edges are unsafe:**

- Direct-provider fallback, direct webhooks and payouts still exist.
- Charge verification is not bound to the caller/entity.
- Local records are not a reliable audit trail.
- Several UI/business flows are broken or fake.

---

## 3. Customer-side flow matrix

| # | Flow | Entry point(s) | Rail | Amount source | Server verification | Local record | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Cart / buy-now checkout | `POST /order/checkout` (both apps) | MCOM Pay: `stripe` \| `paypal` \| `wallet` | Server recomputes; client amount cross-checked (`order.service.ts:801-807`) | status + amount + currency only | `orders` + `order_payments`; Stripe/PayPal store provider id, **not MCOM charge id**; wallet stores charge id | ⚠️ Paid order stays `PENDING`; replayable; charge before order |
| 2 | Two-step checkout (unused by UI) | `POST /checkout/initiate` + `/checkout/complete` | MCOM Pay | Server (stored order) | same | **No `OrderPayment` written** | 🔴 One paid charge can complete N orders; no payment row |
| 3 | Membership (new plans) | `/membership/initiate-payment` → `/payments/record` | MCOM Pay | Server price from `planVariantId` | MCOM charge verify | `payment_histories` + `membership_payments` + `mcom_pay_charges` | ⚠️ Works, but duplicate ledgers and `viaSolutions` bypass |
| 4 | Membership (legacy page) | `/membership/initiate-payment` → `/membership/verify-payment` | MCOM Pay + legacy wallet hold fallback | Server price (hardcoded tiers) | MCOM charge verify | `membership_payments` | ⚠️ Orphan page; legacy hold path; success dialog expects missing relation |
| 5 | Admin pricing | `/payments/stripe/create-intent` \| `/payments/paypal/create-order` → `/payments/record` | MCOM Pay | **Client amount accepted** (≤ £50,000); hardcoded prices | status + amount + currency | `payment_histories` only, no membership | 🔴 Admin can pay and get no plan |
| 6 | Gift cards | `/gift-cards/purchase` (+ verify) | MCOM Pay | Server-validated vs template | MCOM charge verify | `orders` + `order_payments` + gift card + digital-value mirror | ⚠️ No metadata → random idempotency key |
| 7 | Gift-card reload | `/gift-cards/:code/initiate-reload` | MCOM Pay | **Client amount, no template bound** | MCOM charge verify | same | ⚠️ Unbounded reload; random key |
| 8 | Vouchers | `/vouchers/initiate-purchase` (+ verify) | MCOM Pay | Server-validated | MCOM charge verify | order + voucher + mirror | ⚠️ Random key; replay returns latest voucher |
| 9 | Voucher reload | `/vouchers/:code/initiate-reload` | MCOM Pay | Client amount, unbounded | MCOM charge verify | order + voucher | ⚠️ |
| 10 | Coupon products | `/coupons/initiate-purchase` (+ verify) | MCOM Pay | Server-validated | MCOM charge verify | order payment + coupon | ⚠️ Random key; repeated reference |
| 11 | Coupon reload | `/coupons/:code/initiate-reload` | MCOM Pay | Client amount, unbounded | MCOM charge verify | order payment | ⚠️ |
| 12 | Bookings | `/bookings/initiate-payment` → `/bookings/verify-payment` | MCOM Pay (wallet/card/PayPal) | Server-computed | status + amount + currency | `service_payments` (no unique txn) | 🔴 Replayable; expected total misses price-reducer/money-voucher |
| 13 | Wallet top-up (new) | `/payments/wallet/topup/initiate|confirm` | MCOM Pay card → **MCOM Wallet credit** | Initiate amount validated 5–500 | charge amount re-read server-side | charge mirror; central wallet txn id discarded | ⚠️ Credits Central wallet from mall funds |
| 14 | Wallet funding (legacy) | `/wallet/fund/initiate|verify` | MCOM Pay card/PayPal → **MCOM Wallet credit** | Client amount, min £10, no max | charge verify | local `Wallet` **and** Central wallet both credited | 🔴 Double ledger; economic double-count |
| 15 | Withdrawals | `POST /wallet/withdraw/request` | None (local only) | Local earnings | n/a | local withdrawal `PENDING` | 🔴 Never paid out; UI is mock data |
| 16 | Campaign cashback contributions | `/campaign-cashback/:id/contribute*` | MCOM Pay | Initiate server value; completion client amount with floor check | MCOM charge verify | `order_payments` + flag | ⚠️ Client can pay more than level value |
| 17 | Money engine / PAYG vouchers | `/money-engine/purchase*`, `/contribute*` | MCOM Pay + internal ledger | Server (face value × split) | MCOM charge verify | `payment_histories` + voucher + mirror | ✅ Mostly correct; internal mint/spend is by design |
| 18 | Digital value fund | `POST /digital-value/consumer/:id/fund` | **None** | Client | **None** | digital-value ledger | 🔴 Free balance mint |
| 19 | Partner instruments (Rewards) | `/partner/instruments/*` | No money (issuance) | Partner | Scope/flag checks | instrument + outbox | ✅ Out of scope |

**Customer UI notes:** `PaymentSuccessDialog` and wallet summaries are presentational only. The only genuinely Central-backed ledger shown to users is `GET /wallet` (Central balance + transactions). Invoice/receipt pages read local `payment_histories` only.

---

## 4. Business / admin-side flow matrix

| Flow | Entry point | Rail | Findings |
|---|---|---|---|
| Business plan purchase | Customer pricing UI used by owners | MCOM Pay | Same as membership; plan price duplicated in admin UI |
| Admin plan purchase | `McomMallAdmin/app/pricing` | `/payments/stripe/create-intent` with `{ amount }` | Hardcoded prices (`pricingData.ts`); no `planVariantId`, so **no membership is created** |
| Admin product checkout | `McomMallAdmin/app/checkout` | `/order/checkout` | **Broken**: never creates `clientSecret`/`orderID`; admin env has no Stripe/PayPal keys |
| Admin transactions / billing | `GET /admin/transactions` | Local DB only | `totalFees: 0`, `refundCount: 0`; no MCOM Pay fee/net; search/type filters ignored; `skip/3` heuristic |
| Business earnings | `walletService.creditEarning` | Local ledger | Not tied to MCOM charge fee/net; not reconcilable |
| Business payouts | `createStripeTransfer`, `createPaypalPayout` | **Mall-owned Stripe/PayPal credentials** | Outside MCOM Pay; payout failures swallowed while local ledger releases funds |
| Booking payouts | `booking.service.ts:2111-2130` | Mall Stripe/PayPal | Same |
| Withdrawals | `POST /wallet/withdraw/request` | None | Debits local earnings, never executes payout |
| Invoice/receipt download | Customer/admin billing pages | Local only | Buttons only toast; status hardcoded `paid` |

---

## 5. Findings (severity-ordered)

### 🔴 Critical

**C1 — Free-money endpoint: digital-value funding has no payment verification.**
`apps/mcom_mallAPI/src/resources/digital-value/controllers/digital-value-consumer.controller.ts:85-106` accepts a `fund` body and writes balance after only an ownership check. The service (`digital-value.service.ts:122-173`) has no provider reference, amount cap, idempotency, or payment lookup. The Swagger text admits payment verification is "omitted".
*Impact:* any authenticated owner of an instrument can mint spendable balance.
*Fix:* remove the route from consumer controllers; make funding internal/service-auth only, and require a verified MCOM charge id + amount.

**C2 — One paid charge can complete unlimited orders (`/checkout/complete`).**
`checkout.service.ts:577-646` verifies status/amount/currency, then `:648-791` completes the order. It never records an `OrderPayment`, never checks `charge.reference`/`mcomUserId`, and never marks the charge consumed. A single paid intent/order of amount X can complete any number of pending orders of amount X.
*Evidence:* no `OrderPayment` in `checkout.service.ts`; verification in `payment-provider.service.ts:418-484` checks only status/amount/currency.
*Fix:* persist a payment row with a **unique** `mcomChargeId` per order and reject a charge already linked elsewhere; bind to the authenticated user and order reference.

**C3 — Booking payment replay / non-unique transaction id.**
`booking.service.ts:1855-1862` inserts a `ServicePayment` with the client `transactionId`; `service-payment.entity.ts:22-24` has no unique constraint. `verifyPayment` (`:1765`) never checks `dto.transactionId === booking.paymentIntentId` and never checks it was not used by another booking.
*Fix:* unique index on `transaction_id`; verify charge ownership + booking binding; store `mcomChargeId`.

**C4 — Paid orders never leave `PENDING`.**
`order.service.ts:947` sets `status: finalAmount <= 0 ? COMPLETED : PENDING`. There is no later transition in `order.service.ts` (only `checkout.service.ts:789` completes the unused two-step path). Paid card/PayPal/wallet orders therefore stay `PENDING` while stock is decremented, cart cleared and earnings credited.
*Fix:* set `COMPLETED` once the provider charge is verified and the transaction commits (or transition from the webhook).

**C5 — Charges are not bound to the paying user.**
`verifyMcomPayCharge` (`payment-provider.service.ts:418-484`) never compares `charge.mcomUserId`, `externalCustomerId`, `reference` or `metadata` to the caller/entity. Every flow that accepts a client `transactionId` inherits this: order, membership, booking, gift card, voucher, coupon, top-up, campaign.
*Impact:* a user who obtains another user's paid charge id of the same amount can redeem it (membership/booking/gift card). Charges are unguessable cuids, but the authorization model is wrong and the blast radius is large.
*Fix:* one shared `assertChargeBelongsTo(charge, { userId, purpose, entityId, amountMinor, currency })` used by every verifier; also check the charge is not already allocated.

**C6 — `/payments/record` lets any authenticated user forge a payment history and cashback.**
`record-payment.dto.ts:71-78` exposes `viaSolutions`, and `payments.service.ts:174-183` skips provider verification when it is true. The history row is saved at `:247` **before** any membership verification, and cashback is posted at `:279-294` with the forged amount/transaction id. A user can POST `{ viaSolutions:true, paymentGateway:'STRIPE', amount: 50000, transactionId:'x' }` with no tier/plan and get a `PAID` subscription status.
*Fix:* delete the `viaSolutions` escape hatch (MCOM Pay made it obsolete), restrict `/payments/record` to ADMIN or remove it in favour of `/membership/verify-payment`; persist only inside the membership transaction.

### 🟠 High

**H1 — Wallet money is taken before the business operation is safe.**
Wallet method through MCOM Pay settles **at create time** (`payment-provider.service.ts:214-219`). In `/order/checkout` the charge is created at `order.service.ts:894-907`, outside the DB transaction that starts at `:925`. In `/checkout/initiate` the charge is created at `checkout.service.ts:496-505` and completion can still fail on stock/redemption (`:688-692`). Membership wallet initiation (`membership.service.ts:326-368`) also settles immediately; if the user never verifies, money is gone. `/checkout/complete` has no refund path at all.
*Fix:* for pre-auth flows use MCOM Wallet `hold/place` → `hold/capture` at final confirmation → `hold/release` on failure/expiry (the guide supports this). Or create the wallet charge only at final verification. Never debit before the order/booking row is committed.

**H2 — Client-controlled idempotency + charge-before-order can refund an existing order.**
`/order/checkout` passes `createCheckoutDto.payment.idempotencyKey` straight into the charge (`order.service.ts:900-902`). If two requests reuse the key, MCOM Pay replays the same charge id; the second insert fails the unique `order_payments.transactionId`, and the catch calls `refundStripePayment(walletTransactionId)` (`:1336-1352`) — refunding the charge that backs the **first, already-committed order**.
*Fix:* generate the key server-side from an immutable draft/order id; make the payment record insert idempotent (return existing order instead of refunding); refund only if this request created the charge.

**H3 — Idempotency keys are random or absent in most flows.**
`payment-provider.service.ts:516-521` falls back to `randomUUID()`; `paymentIdempotencyKey` ignores `metadata.reference`. Affected: gift-card/voucher/coupon purchase and reload (no metadata at all — `gift-card.service.ts:447-462`, `voucher.service.ts:346-361`, `:643-657`), wallet funding (`wallet.service.ts:519-523`, `:533-537`), wallet top-up proxy (`wallet-topup-proxy.service.ts:87` — explicit random UUID), campaign contributions (`campaign-cashback.service.ts:268-315`), and the pricing page mount (`PricingCheckoutClient.tsx:105-165`).
*Impact:* retries/double-clicks create duplicate charges; references collapse to `stripe-25.00`, which is not unique per buyer.
*Fix:* require a deterministic key per business event; derive from local payment intent/order/booking id; remove random fallbacks.

**H4 — Admin pricing can create client-priced charges and grants no plan.**
`POST /payments/stripe/create-intent` and `/payments/paypal/create-order` accept `amount` from the body (`payments.service.ts:54-124`) with only `0 < amount ≤ 50000`. Admin sends hardcoded prices and no plan ids (`McomMallAdmin/app/pricing/components/PricingCheckoutClient.tsx:64-110`). `recordPayment` only creates a membership when `tierId || planVariantId` is present (`payments.service.ts:250`).
*Fix:* require a server-side product/plan reference for every intent; load admin prices from `/plans`; either grant the membership or reject the payment.

**H5 — Admin checkout is non-functional.**
`McomMallAdmin/app/checkout/components/CheckoutClient.tsx` never calls create-intent/create-order and passes neither `clientSecret` nor `orderID` to `PaymentForm` (`:228-234`); `PaymentForm` renders no widget without them. `McomMallAdmin/.env.local` has no `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_PAYPAL_CLIENT_ID`; `StripeCheckoutForm.tsx:15-17` calls `loadStripe(undefined)`. The PayPal component falls back to `'sb'`.
*Fix:* same checkout widget as the customer app, with keys from a server config endpoint; or remove the admin checkout until rebuilt.

**H6 — Direct Stripe/PayPal paths are still live.**
- `payment-provider.service.ts:49-101` builds Stripe/PayPal SDK clients from mall secrets; direct create/verify/refund branches at `:140-151`, `:191-208`, `:298`, `:323-352`, `:555-561`, `:643-653`.
- `POST /payments/stripe/webhook` and `/payments/paypal/webhook` (`payments-webhook.controller.ts:77-171`) remain active.
- Payouts always use mall credentials: `createStripeTransfer` (`:525-537`), `createPaypalPayout` (`:564-623`).
- Frontends still have mall key fallbacks (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) and hardcoded PayPal client ids (`McomMall/components/PayPalButtonWrapper.tsx:8-10`, `McomMallAdmin/components/PayPalButtonWrapper.tsx:8-9`).
*Impact:* a config flip (`MCOM_PAY_ENABLED=false`) silently switches the mall to its own merchant accounts, bypassing Central's ledger; leftover webhooks create a second source of truth.
*Fix:* remove the fallback; fail fast if MCOM Pay is disabled or the HMAC secret is missing. Return `410 Gone` from direct provider webhooks (or delete them). Isolate/decide payouts separately.

**H7 — Card top-up credits the Central wallet from mall funds and doubles the local ledger.**
`wallet.service.ts:553-599` collects card money via MCOM Pay, then calls `mcomWalletService.credit(...)` for the full amount and also increments the local `Wallet.spendableBalance` (`:626-665`). `wallet-topup-proxy.service.ts:80-156` does the same (without the local wallet). The mall receives `netMinor` (amount − fee) but credits the user the full amount into Central, and the user also has a local spendable balance.
*Impact:* accounting loss equal to the MCOM fee on every top-up; two balances for the same money; Central wallet is funded by the partner rather than by a Central top-up.
*Fix (recommended):* remove in-app card top-up and deep-link to Central's wallet page (`/dashboard/wallet`, already exposed as `topUpUrl`). If product requires in-app top-up, ask Central for a supported top-up/credit contract and record the fee explicitly. Keep only one spendable balance (Central).

**H8 — Local record-keeping cannot support audit, fees, or reconciliation.**
- `mcom_pay_charges` has only `chargeId, providerRef, method, amountMinor, currency, reference, status, metadata` (`mcom-pay-charge.entity.ts`, migration). No `feeMinor`, `netMinor`, `mcomUserId`, `externalCustomerId`, `provider`, `paidAt`, `refundedMinor`.
- `recordCharge` swallows DB errors (`mcom-pay.service.ts:391-396`), so a paid charge can be missing locally.
- Orders store the Stripe PI / PayPal order id, not the MCOM charge id (`order.service.ts:929-935`); membership/booking rows likewise.
- `McomPayService.resolveChargeId` guesses that any `c…` string is a charge id (`:299-306`), and returns null for `pi_…` when the local mirror row is missing — a paid charge then fails verification and the order is rejected with no refund.
- No webhook event store; no reconciliation job; no metrics.
*Fix:* expand the mirror, add a webhook-events table, link charges to business entities, stop swallowing write failures (outbox/retry), and reconcile daily.

**H9 — MCOM Pay webhooks do not reconcile business outcomes.**
`payments-webhook.controller.ts:53-74` only calls `updateLocalStatus`. It does not complete orders, grant memberships, or credit bookings, and `updateLocalStatus` is a no-op if the local row is missing. If the browser closes before confirm, the money is paid but the entitlement never happens.
*Fix:* webhook handler must upsert the charge and dispatch to purpose handlers (order/membership/booking/top-up), idempotently.

**H10 — Booking verification total is wrong when a price-reducer or money-voucher is used.**
`booking.service.ts:1806-1812` subtracts reward/coupon/gift-card/voucher but omits `priceReducerAmountApplied` and `moneyVoucherAmountApplied`, which are deducted from `payableAmount` at `:1590-1598`. Those bookings can never verify.
*Fix:* compute expected amount with the same helper used to compute payable amount.

**H11 — PayPal integration is incompatible with Central-owned orders.**
The backend returns `approvalUrl`, but no frontend ever uses it. Instead they mount the PayPal JS SDK with `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (mall's merchant) and return a server-created order id; the SDK `createOrder` must belong to the same PayPal merchant as the client id. Customer `PayPalCheckoutButton.tsx:29-37` also calls `actions.order.capture()` in the browser, while the backend captures/confirms again.
*Fix:* redirect to `approvalUrl` (guide B1.1) or use Central's PayPal client id in the SDK; never capture client-side.

**H12 — Stripe key handling is inconsistent.**
Customer app prefers `NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY` but falls back to the mall key; `PaymentModal`/`StripeCheckoutForm`/`BookingModal` do `loadStripe('')` when both are missing; one committed env file points `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` at a **different Stripe account** than the Solutions key; admin has no key at all.
*Fix:* serve one publishable key from the API (`GET /payments/config`) sourced only from `MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY`; fail closed if absent.

### 🟡 Medium

**M1 — Reload amounts are not validated against the product/template** (gift card `:735-800`, voucher `:591-721`, coupon `:1389-1392`), so a user can reload an arbitrary amount.
**M2 — Withdrawals never execute.** `wallet.service.ts:739-793` debits local earnings and creates `Withdrawal{PENDING}`; there is no approval/payout worker. Customer `Withdraw.tsx:32-73` is hardcoded mock data.
**M3 — Admin billing/transactions are fake/partial.** `transactions.admin.service.ts:51-56` hardcodes fees/refunds; `findAll` ignores `search`/`type`; `skip: skip/3` is a heuristic; only orders/bookings/memberships are included (gift cards, vouchers, coupons, top-ups, campaign contributions and MCOM Pay fees are invisible).
**M4 — Fake card capture stores raw PAN in `localStorage`.** `McomMall/app/dashboard/settings/payment-method/page.tsx:67-71` writes PAN/expiry/name to `localStorage`; billing page renders it as a saved card (`:28-30`). This is a PCI violation and must be removed.
**M5 — Dead/duplicate payment code.** `SolutionsPaymentProxyService` (registered, never injected), `service/payment/*`, `stripe-provider.tsx`, dead `PurchaseCouponModal`/`ReloadCouponModal`, admin `PayPalButtonWrapper` (simulated success), admin `PaymentSuccess*`, admin payment hooks, `MembershipClient` orphan page, `POST /order` stub returning `new Order()`, dead `payments/checkout` boost call.
**M6 — API hardening.** Global `ValidationPipe` has no `whitelist`/`forbidNonWhitelisted`; no throttling; webhook replay cache is in-memory only (`payments.service.ts:358-380`); `X-Idempotency-Key` not length/format validated.
**M7 — Currency inconsistencies.** `order.service.ts:935` stores `'MCOM'` for wallet orders (should be GBP); membership stores `'MCOM'` on the legacy hold path (`membership.service.ts:493`); UI shows `$`, `₦` and `£` for GBP.
**M8 — Config validation only warns.** Missing `MCOM_HMAC_SECRET` logs a warning (`mcom-pay.service.ts:122-126`), it does not prevent boot; `McomPayService` and `McomWalletService` resolve the secret differently (wallet supports `MCOM_<CLIENT>_SECRET`, pay does not).
**M9 — No tests or observability for payments.** No `mcom-pay.service.spec.ts`, no provider routing tests, no webhook tests, no reconciliation metrics/alerts.
**M10 — `resolveChargeId` heuristic** treats any `c…` value as a charge id and hides a missing mirror row.

### 🔵 Low / product decisions

**L1 — No recurring billing.** No `@nestjs/schedule`/`@Cron`; plans are one-off with expiry (`plan-expiry.service.ts`). UI contradicts itself: "One-off payment · no auto-renewal" vs "Auto-renewal: Active" / "Renews on …". Nothing reads `stripePriceId`/`paypalPlanId`.
**L2 — `/payments/record` has no idempotency key** beyond the unique `transactionId`; it also writes cashback outside a transaction.
**L3 — `/payments/paypal/capture-order` is available to any authenticated user** with any order id (no ownership check).
**L4 — Pricing page creates an unused charge on mount** (`PricingCheckoutClient.tsx:105-165`): every visit to `/pricing` with a plan variant creates a real MCOM Pay PaymentIntent that is never used.
**L5 — Two membership UIs** (`/pricing` and orphan `/dashboard/marketing/membership`) with different tier prices and different backends.

---

## 6. Record-keeping assessment ("keep records here too")

### What exists today

| Table | Purpose | MCOM charge id? | Fee/net? | Status lifecycle? |
|---|---|---|---|---|
| `mcom_pay_charges` | Local mirror of Central charges | ✅ `chargeId` | ❌ (inside JSON) | ✅ but only via webhook `updateLocalStatus` |
| `order_payments` | Cart/gift-card/voucher/coupon/top-up | wallet only | ❌ | ❌ no status |
| `membership_payments` | Membership | wallet only | ❌ | ❌ |
| `payment_histories` | Membership/PAYG history | ❌ | ❌ | ❌ |
| `service_payments` | Bookings | ❌ | ❌ | ❌ |
| `user_campaign_cashback` | Campaign contribution | ❌ | ❌ | flag only |
| `digital_value_*` | Instrument ledger | ❌ | ❌ | fund/redeem |

**Conclusion:** there is a *partial* mirror, but not an auditable local ledger. You cannot answer "what did MCOM charge us in fees last month", "which order does this charge belong to", "which paid charges have no entitlement", or "did we refund everything we should have".

### Recommended local ledger design

Add three things (names indicative):

**1. Expand `mcom_pay_charges` — immutable mirror**
```
charge_id (unique), app_client_id, method, status,
amount_minor BIGINT, fee_minor BIGINT, net_minor BIGINT, refunded_minor BIGINT,
currency, reference, description,
mcom_user_id, external_customer_id,
provider, provider_ref, wallet_debit_amount_minor,
paid_at, created_at_central, raw JSONB, synced_at
```
Indexes: `status`, `reference`, `mcom_user_id`, `provider_ref`, `paid_at`.

**2. `payment_allocations` — charge → business entity**
```
id, mcom_charge_id, purpose (ORDER|MEMBERSHIP|BOOKING|GIFT_CARD|VOUCHER|COUPON|WALLET_TOPUP|CAMPAIGN|PAYG),
entity_type, entity_id, user_id, amount_minor, currency, created_at,
UNIQUE (mcom_charge_id, purpose, entity_id),
UNIQUE (purpose, entity_id)          -- one charge per business event
```
This is what makes replay impossible and lets any business row find its charge.

**3. `mcom_pay_webhook_events` — idempotent inbox**
```
id, event, charge_id, payload JSONB, raw_hash (unique), signature_verified,
received_at, processed_at, attempts, last_error
```
Process each event once; keep the raw body for audit.

**Also:**
- Add `mcom_charge_id` (and `provider_ref`, `status`, `fee_minor`, `net_minor`) to `order_payments`, `membership_payments`, `payment_histories`, `service_payments`.
- Add `wallet_txn_id` (Central response id) next to the charge id on top-up rows.
- Make `recordCharge` fail closed or write to an outbox instead of swallowing errors.
- Add a daily reconciliation job + `POST /admin/payments/reconcile` (date range): `GET /app-payments/charges` → upsert mirror → flag paid-without-allocation and allocated-without-paid.
- Metrics/alerts: webhook signature failures, pending charges older than 15 min, paid charges without allocation, failed refunds, mirror-vs-central count mismatch.

### Per-flow record rules

| Flow | Must store |
|---|---|
| Order | `orders` + `order_payments(mcom_charge_id, provider_ref, status, amount, currency, fee, net)` + allocation |
| Membership | `membership_payments(mcom_charge_id, ...)` + allocation; do not double-write `payment_histories` |
| Booking | `service_payments(mcom_charge_id, ...)` + unique txn + allocation |
| Gift card/voucher/coupon | existing order/payment rows + charge id + allocation |
| Wallet top-up | charge id + **Central wallet transaction id** + allocation |
| Campaign/PAYG | charge id + allocation |
| Refund | `refunded_minor`, `paid_at`, refund reference/ledger row |

---

## 7. Recurring billing assessment (Part C)

- **MCOM-owned plans:** Central renews them; the mall does not call partner APIs. ✅ out of scope.
- **Mall memberships:** sold as **one-off** with expiry; there is no scheduler, no `nextChargeAt`, no dunning, no mandate. ❌
- **Card/PayPal recurring:** MCOM Pay charges are one-time and Central stores no partner mandate. Auto-renew is impossible without your own mandate. ❌
- **Wallet recurring:** possible today via `POST /wallet/partner/debit` with a per-period key, but the mall never calls `debit` (only `credit`). ❌

**Decision required (see §12).** If auto-renew is a product promise:
1. Add `nextChargeAt`, `interval`, `status (active|past_due|canceled)`, `amountMinor`, `paymentMethod` to the subscription/membership row.
2. Daily cron at 02:00 UTC; key `${CLIENT_ID}-sub-${subId}-${period}` (new per period, same on retries).
3. Wallet: `POST /wallet/partner/debit`, `category: "SUBSCRIPTION"`.
4. Card/PayPal: either your own provider mandate or manual invoice; do **not** claim auto-renew with one-time MCOM Pay charges.
5. Dunning +1d/+3d/+7d, grace period, notify, then cancel and revoke.
6. Webhook `payment.succeeded` remains the backstop; make it idempotent per renewal cycle.

If auto-renew is **not** a product promise: remove "Auto-renewal: Active" and "Renews on …" from the UI; make expiry + manual repurchase explicit.

---

## 8. Security & operational risks

| Risk | Evidence | Mitigation |
|---|---|---|
| Charge reuse across users/entities | C2, C3, C5 | allocation table + ownership checks |
| Free balance mint | C1 | remove/gate endpoint |
| Forged payment history / cashback | C6 | remove `viaSolutions`, admin-only record |
| Duplicate charges on retry/double-click | H2, H3 | deterministic keys + local intent |
| Money taken, no goods | H1, C4 | holds or charge-at-confirm; completion transition |
| Two sources of truth | H6, H7 | remove direct provider fallback/webhooks; one ledger |
| Sensitive data in browser storage | M4 | delete fake card form |
| No audit trail / reconciliation | H8, H9 | ledger + webhook inbox + job |
| Missing fail-fast / weak validation | M6, M8 | Joi required when enabled; whitelist; throttling |
| Secrets in committed env files | `.env`, `.env.local`, root `mcommall.env` contain test secrets | rotate and move to secret manager; do not commit |

---

## 9. Remediation plan

> Ordering is deliberate: stop money loss/fraud first, then make records trustworthy, then fix UX. Each phase should ship independently with tests.

### Phase 0 — Stop the bleeding (1–2 days)

1. **Enforce Central as the only money-in rail.**
   - `PaymentProviderService`: delete the direct Stripe/PayPal create/verify/refund branches and the `useDirectProviders` fallback. Throw at boot if `MCOM_PAY_ENABLED=false` or `MCOM_HMAC_SECRET` is missing.
   - Return `410 Gone` from `POST /payments/stripe/webhook` and `/payments/paypal/webhook` (or remove the routes) so they cannot become a second source of truth.
   - Keep `STRIPE_SECRET_KEY`/PayPal secrets only if a separate, explicit payout service needs them.
2. **Kill the free-money and forgery paths.**
   - Remove `POST /digital-value/consumer/:id/fund` from the consumer controller (or require a verified charge + internal auth).
   - Remove `viaSolutions` from `RecordPaymentDto` and the skip branch; restrict `/payments/record` to `ADMIN` or delete it.
   - Add role/ownership checks to `/payments/paypal/capture-order`.
3. **Remove client-supplied amounts from intent creation.**
   - `/payments/stripe/create-intent` and `/payments/paypal/create-order` must require `planVariantId`/`tierId`/`orderDraftId`/`bookingId`; reject raw `amount` (or admin-only).
4. **Delete fake card handling.** Remove `dashboard/settings/payment-method` PAN/CVV form and `localStorage` card display; replace with "Manage in MCOM Central".

**Exit criteria:** no route can create a charge from a client amount; no route mints value; no direct provider webhook is reachable; app refuses to boot without MCOM Pay config.

### Phase 1 — Correctness & fraud prevention (3–5 days)

1. **Introduce a local payment intent** (table `payment_intents` or the allocation table above):
   - Create the row **before** calling Central, with a server-generated deterministic idempotency key.
   - Store `mcomChargeId`, `providerRef`, status, amount, method.
   - All flows call `createPaymentIntent({ purpose, entityId, userId, amountMinor, method })`.
2. **One shared verifier** `assertChargeSettledFor({ chargeId, userId, purpose, entityId, amountMinor, currency })`:
   - loads the charge from Central,
   - checks `status === 'paid'`, exact minor amount, currency,
   - checks `mcomUserId`/`externalCustomerId`/`reference` match the caller/entity,
   - checks no existing allocation for this charge/entity.
3. **Make replay impossible:** unique `mcom_charge_id` per business entity; unique `transaction_id` on `service_payments`; unique `(purpose, entity_id)`.
4. **Fix order lifecycle:** set `orders.status = COMPLETED` after a verified paid checkout commits; add a webhook backstop.
5. **Move wallet charges to the confirm step** (or use `hold/place` + `capture` + `release`) for checkout, membership, booking; refund/release on failure/expiry.
6. **Fix booking expected amount** to include price-reducer and money-voucher.
7. **Remove `resolveChargeId` guessing**; fail closed if the local mirror row is missing, then fetch by `GET /charges/:id` and upsert.
8. **Make `recordCharge` reliable:** no swallow; write to outbox or retry; log with charge id.

**Exit criteria:** replay tests fail closed; double-click/retry creates one charge; wallet failure leaves no stranded debit; paid order completes.

### Phase 2 — Trustworthy local ledger (3–5 days)

1. Migration: expand `mcom_pay_charges`, add `payment_allocations`, `mcom_pay_webhook_events`, and linkage columns on order/membership/booking/payment-history tables.
2. Rewrite webhook handler: verify HMAC → persist event (unique hash) → upsert charge → dispatch by purpose → 200. Keep raw payload.
3. Add `GET /payments/:id/ledger` (or admin equivalent) and admin list/export of charges with fee/net/refund.
4. Add reconciliation job (`GET /app-payments/charges?dateFrom&dateTo`) + admin trigger; flag:
   - paid charge with no allocation,
   - allocation with non-paid charge,
   - mirror row missing in Central,
   - refund mismatch.
5. Replace admin billing KPIs (`totalFees`, `refundCount`) with real ledger aggregates; include all payment domains.
6. Store Central wallet transaction id on top-ups; decide/remove the local `Wallet` double credit.

**Exit criteria:** for any order/booking/membership, you can find the Central charge, fee, net, payer, provider ref and refunds locally; reconciliation is clean.

### Phase 3 — Frontend & UX correctness (2–4 days)

1. Add `GET /payments/config` returning `{ mcomPayEnabled, publishableKey, paypalMode, topUpUrl }`; all apps use it. Remove frontend fallbacks/hardcoded keys.
2. Stripe: one `PaymentElement` flow per screen with Central's key; handle `redirect: 'if_required'` and a real return page (`?payment_intent=…`) that calls confirm/verify.
3. PayPal: use `approvalUrl` redirect (or official SDK with Central's client id); remove client-side `actions.order.capture()`.
4. Wallet: show `availableBalance` from Central; on 402/`INSUFFICIENT_BALANCE` show a top-up CTA using `topUpUrl` in **every** flow (checkout, booking, gift card, voucher, coupon, campaign, membership).
5. Remove the unused intent-on-mount in `PricingCheckoutClient`; remove dead payment components/pages/hooks.
6. Invoices/receipts: render from the local ledger (charge, amount, fee/net where appropriate, status, date), add real PDF/CSV or remove the buttons.
7. Fix admin checkout/pricing: use `/plans`, same payment components as customer, wallet rail, keys from config.
8. Remove currency mismatches (`$`, `₦`, `'MCOM'` for GBP).

**Exit criteria:** every payment screen uses Central-provided credentials, no fake success, no fake card data, top-up recovery works everywhere.

### Phase 4 — Recurring & payouts (decision-dependent, 3–5 days each)

1. If auto-renew is required: implement Part C scheduler/dunning for wallet; document card/PayPal limitation or add a mandate.
2. If not: remove auto-renewal copy.
3. Payouts/withdrawals: decide between (a) Central payouts API if/when available, or (b) an isolated payout service using mall credentials with its own audit/approval. Implement withdrawal execution + approval UI; stop crediting "paid" before payout succeeds.

### Phase 5 — Test, observe, launch (2–3 days)

- Add unit tests: HMAC/signing, idempotency, retry classification, 422 mapping, verifier (amount/currency/ownership), webhook signature/idempotency, provider routing (assert no direct SDK calls).
- Add e2e with a mock Central (`nock`/MSW): one test per flow for success, amount mismatch, replay, duplicate webhook, refund, wallet insufficient funds.
- Add contract tests against Central sandbox: create → confirm → refund for stripe/paypal/wallet.
- Add metrics/logs/alerts; run reconciliation in staging; then production smoke with real test cards and PayPal sandbox buyer.

---

## 10. Test plan (minimum)

| Test | Expected |
|---|---|
| Same `X-Idempotency-Key` twice on `/charges` | same charge returned, one debit |
| Two `/order/checkout` calls, same draft | one charge, one order (or idempotent replay) |
| Reuse a paid charge id for a second order/booking | rejected 409/400, no entitlement |
| Paid charge amount ≠ local amount | rejected, no entitlement |
| Paid charge belongs to another user | rejected |
| Wallet charge then DB failure | refund/release succeeds, no stranded money |
| Paid order | status `COMPLETED` |
| Webhook replay | processed once |
| Webhook invalid signature | 401, no state change |
| `422 INSUFFICIENT_BALANCE` | 402 with `topUpUrl`, UI shows CTA |
| Refund full/partial | local + Central status/amount match |
| MCOM Pay disabled / secret missing | app fails fast (no direct provider fallback) |
| Digital-value fund without payment | endpoint unavailable/forbidden |

---

## 11. Go-live checklist (mapped to guide Part F)

**Shared**
- [ ] Per-app `hmacSecret` and Webhook URL registered in MCOM Console
- [ ] `MCOM_SOLUTIONS_URL`, `MCOM_CLIENT_ID`, `MCOM_HMAC_SECRET`, `MCOM_WEBHOOK_SECRET` server-side only; app fails fast if missing
- [ ] No direct-provider secrets used for money-in; direct webhooks removed/disabled

**Wallet**
- [ ] `GET /balance` returns `ACTIVE` before charging; 402 top-up CTA everywhere
- [ ] Wallet charges use holds or charge-at-confirm, never initiate-then-strand
- [ ] `INSUFFICIENT_BALANCE` mapped to 402 with `topUpUrl`
- [ ] One spendable balance (Central); local wallet only for earnings

**Recurring**
- [ ] Decision made: auto-renew or one-off
- [ ] If auto-renew: scheduler in backend, UTC, per-period key, dunning, grace, cancel
- [ ] UI copy matches reality

**MCOM Pay**
- [ ] Charges created server-side only; no client amount
- [ ] Amounts integer minor units; exact match verification
- [ ] Stripe = official PaymentElement with Central key
- [ ] PayPal = `approvalUrl` redirect / Central merchant SDK; no client capture
- [ ] Confirm called + webhook verified + idempotent
- [ ] Refunds only via `/charges/:id/refund`
- [ ] Fee config reviewed

**Both**
- [ ] 409/429/5xx retried with backoff, same key
- [ ] Sandbox Stripe/PayPal + real MCOM user tested end-to-end

---

## 12. Decisions needed before Phase 2/4

1. **Wallet spend rail:** MCOM Pay `method:'wallet'` (unified ledger, but Central may apply its fee) vs Wallet `/wallet/partner/debit` (moves credits, likely no MCOM Pay fee, separate ledger). Current code uses MCOM Pay. Confirm the fee treatment with Central before scaling.
2. **In-app card top-up:** redirect to Central's wallet page (recommended) vs keep mall-funded crediting (requires explicit fee accounting and one balance).
3. **Payouts:** keep mall-owned Stripe/PayPal payouts (isolated) vs wait for a Central payout API. Withdrawals cannot stay "pending forever".
4. **Recurring:** implement auto-renew or remove the claim.
5. **Legacy endpoints/pages:** delete `SolutionsPaymentProxyService`, legacy membership page, `/checkout/initiate|complete`, `POST /order` stub, and dead UI now, or keep behind flags?
6. **Admin checkout:** rebuild on the shared payment widget or remove the page.

---

## Appendix A — Key files reviewed

**API — payment core**
- `apps/mcom_mallAPI/src/resources/payments/services/mcom-pay.service.ts`
- `.../mcom-wallet.service.ts`
- `.../payment-provider.service.ts`
- `.../payments.service.ts`
- `.../wallet-topup-proxy.service.ts`
- `.../solutions-payment-proxy.service.ts` (dead)
- `.../payments.controller.ts`, `.../payments-webhook.controller.ts`
- `.../entities/mcom-pay-charge.entity.ts`, `.../entities/payment-history.entity.ts`
- `apps/mcom_mallAPI/src/database/migrations/1792000000000-CreateMcomPayCharges.ts`
- `apps/mcom_mallAPI/src/config/env.validation.ts`, `src/main.ts`

**API — flows**
- `order/order.service.ts`, `order/order.controller.ts`, `order/entities/order-payment.entity.ts`
- `checkout/checkout.service.ts`
- `membership/membership.service.ts`
- `gift-card/gift-card.service.ts`, `voucher/voucher.service.ts`, `coupon/coupon.service.ts`
- `booking/booking.service.ts`, `booking/entities/service-payment.entity.ts`
- `wallet/wallet.service.ts`
- `campaign-cashback/campaign-cashback.service.ts`
- `money-engine/money-engine.service.ts`
- `digital-value/controllers/digital-value-consumer.controller.ts`, `digital-value.service.ts`
- `admin/services/transactions.admin.service.ts`

**Customer app**
- `app/(public)/checkout/**`, `app/pricing/**`, `app/dashboard/wallet/**`, `app/dashboard/settings/billing|invoices|payment-method/**`
- `components/StripeCheckoutForm.tsx`, `PayPalCheckoutButton.tsx`, `PayPalButtonWrapper.tsx`, `client-provider.tsx`, `BookingPaymentModal.tsx`, `BookingModal.tsx`
- `components/gift-card/**`, `app/(public)/listings/[id]/**`
- `app/dashboard/history/gift-card|my-vouchers|my-coupons/**`
- `app/dashboard/cashback/**`, `app/dashboard/deals/**`, `app/dashboard/coupons-vouchers/page.tsx`
- `hooks/useCheckout.ts`, `useStripePayment.ts`, `usePayPalPayment.ts`
- `service/payments/**`, `service/payment/**` (dead), `service/wallet/**`, `service/membership/**`

**Admin app**
- `app/checkout/**`, `app/pricing/**`, `app/admin/transactions|billing|settings|integrations`
- `components/StripeCheckoutForm.tsx`, `PayPalCheckoutButton.tsx`, `PayPalButtonWrapper.tsx` (dead)
- `hooks/useCheckout.ts`, `useStripePayment.ts` (dead), `usePayPalPayment.ts` (dead)
- `.env.local` (no payment keys)

---

## Appendix B — Dead / duplicate payment code (safe deletion candidates after Phase 3)

- `apps/mcom_mallAPI/src/resources/payments/services/solutions-payment-proxy.service.ts` + spec
- `POST /order` stub (`order.service.ts:175-182`) and `useRecordOrder`
- `service/payment/{index,hook,types}.ts`
- `components/stripe-provider.tsx`
- `app/(public)/listings/[id]/components/PurchaseCouponModal.tsx`
- `app/dashboard/history/my-coupons/components/ReloadCouponModal.tsx`
- `app/dashboard/marketing/membership/**` (orphan legacy membership UI)
- Admin `components/PayPalButtonWrapper.tsx` (simulated success), `PaymentSuccessDialog.tsx`, `PaymentSuccessModal.tsx`, `hooks/useStripePayment.ts`, `hooks/usePayPalPayment.ts`, `service/wallet/*`
- Dead boost payment call (`payments/checkout`) in `VisibilityScreens.tsx`
- Legacy wallet hold/capture fallbacks once wallet charges move to confirm/holds

---

## Appendix C — Evidence highlights

```ts
// Charge verification checks only status/amount/currency — no user/entity binding.
// apps/mcom_mallAPI/src/resources/payments/services/payment-provider.service.ts:434-481
if (charge.status !== 'paid') { ... }
const expectedMinor = BigInt(Math.round(expectedAmount * 100));
const actualMinor = BigInt(charge.amountMinor);
if (actualMinor !== expectedMinor) { ... }
if (charge.currency.toLowerCase() !== currency.toLowerCase()) { ... }
```

```ts
// Paid orders stay PENDING.
// apps/mcom_mallAPI/src/resources/order/order.service.ts:946-947
status: finalAmount <= 0 ? OrderStatus.COMPLETED : OrderStatus.PENDING,
```

```ts
// Two-step checkout never writes OrderPayment — replayable.
// apps/mcom_mallAPI/src/resources/checkout/checkout.service.ts:577-646, 648-791
```

```ts
// Free balance mint.
// apps/mcom_mallAPI/src/resources/digital-value/controllers/digital-value-consumer.controller.ts:100-105
const instrument = await this.digitalValueService.getById(id);
if (instrument.owner.id !== req.user.id) throw new ForbiddenException(...);
return this.digitalValueService.fund(id, fundDto);
```

```ts
// viaSolutions bypass.
// apps/mcom_mallAPI/src/resources/payments/services/payments.service.ts:174-183
const skipProviderVerification =
  recordPaymentDto.viaSolutions === true &&
  purpose === PaymentPurpose.MEMBERSHIP && ...
```

```ts
// Random idempotency key fallback.
// apps/mcom_mallAPI/src/resources/payments/services/payment-provider.service.ts:516-521
const base = metadata?.idempotencyKey || metadata?.orderId || ... || randomUUID();
```

```ts
// Local mirror swallows failures.
// apps/mcom_mallAPI/src/resources/payments/services/mcom-pay.service.ts:391-396
} catch (err: any) {
  // Never fail a payment because local bookkeeping failed.
  this.logger.warn(`Could not persist MCOM Pay charge ...`);
}
```

---

## Appendix D — Suggested schema sketch (for Phase 2)

Not applied — illustrative DDL to make the plan concrete.

```sql
-- 1) Expand the mirror of Central charges.
ALTER TABLE mcom_pay_charges
  ADD COLUMN IF NOT EXISTS "appClientId"       varchar,
  ADD COLUMN IF NOT EXISTS "feeMinor"          bigint,
  ADD COLUMN IF NOT EXISTS "netMinor"          bigint,
  ADD COLUMN IF NOT EXISTS "refundedMinor"     bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "mcomUserId"        varchar,
  ADD COLUMN IF NOT EXISTS "externalCustomerId" varchar,
  ADD COLUMN IF NOT EXISTS "provider"          varchar,
  ADD COLUMN IF NOT EXISTS "description"       text,
  ADD COLUMN IF NOT EXISTS "walletDebitAmountMinor" bigint,
  ADD COLUMN IF NOT EXISTS "paidAt"            timestamptz,
  ADD COLUMN IF NOT EXISTS "centralCreatedAt"  timestamptz,
  ADD COLUMN IF NOT EXISTS "syncedAt"          timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_mpc_paid_at   ON mcom_pay_charges ("paidAt");
CREATE INDEX IF NOT EXISTS idx_mpc_reference ON mcom_pay_charges ("reference");
CREATE INDEX IF NOT EXISTS idx_mpc_user      ON mcom_pay_charges ("mcomUserId");

-- 2) Charge -> business entity. One charge can only fund one business event.
CREATE TABLE IF NOT EXISTS payment_allocations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mcomChargeId" varchar NOT NULL REFERENCES mcom_pay_charges("chargeId"),
  purpose       varchar NOT NULL,           -- ORDER | MEMBERSHIP | BOOKING | GIFT_CARD | ...
  "entityType"  varchar NOT NULL,
  "entityId"    uuid    NOT NULL,
  "userId"      uuid    NOT NULL,
  "amountMinor" bigint  NOT NULL,
  currency      varchar(3) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("mcomChargeId", purpose, "entityId"),
  UNIQUE (purpose, "entityType", "entityId")
);

-- 3) Idempotent webhook inbox.
CREATE TABLE IF NOT EXISTS mcom_pay_webhook_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event       varchar NOT NULL,
  "chargeId"  varchar,
  payload     jsonb NOT NULL,
  "rawHash"   varchar NOT NULL UNIQUE,      -- sha256 of raw body
  "signatureVerified" boolean NOT NULL DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  attempts    int NOT NULL DEFAULT 0,
  "lastError" text
);

-- 4) Linkage on existing business payment rows.
ALTER TABLE order_payments       ADD COLUMN IF NOT EXISTS "mcomChargeId" varchar;
ALTER TABLE membership_payments  ADD COLUMN IF NOT EXISTS "mcomChargeId" varchar;
ALTER TABLE service_payments     ADD COLUMN IF NOT EXISTS "mcomChargeId" varchar;
ALTER TABLE payment_histories    ADD COLUMN IF NOT EXISTS "mcomChargeId" varchar;
CREATE UNIQUE INDEX IF NOT EXISTS uq_service_payments_txn ON service_payments (transactionId);
```

Suggested service contract (single choke point):

```ts
interface CreatePaymentInput {
  purpose: PaymentPurpose;
  userId: string;            // mall user id
  mcomUserId: string;        // central user id (required for wallet, stored for all)
  amountMinor: string;
  currency: 'GBP';
  method: 'stripe' | 'paypal' | 'wallet';
  reference: string;         // immutable business reference
  entityType: string;
  entityId: string;
  idempotencyKey: string;    // server-generated, never client-supplied
}

// 1. insert local payment intent (unique idempotencyKey)
// 2. call MCOM Pay
// 3. persist charge + provider ref
// 4. on confirm/webhook: assertChargeSettledFor(...) then allocate exactly once
```

**Support references:** MCOM Console → Wallet Management → Wallet Admin; guide sections A4/A5 (wallet), B1-B5 (MCOM Pay/webhooks), C (recurring), D (idempotency), F (go-live).
