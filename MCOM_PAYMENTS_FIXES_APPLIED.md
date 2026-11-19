# MCOM Payments — Fixes Applied

**Date:** 2026-11-18
**Companion:** `MCOM_CENTRAL_PAYMENTS_AUDIT.md` (full findings and rationale)
**Status:** Backend hardening + customer/admin payment UI fixes implemented. Typecheck and the full API test suite pass.

---

## 1. What changed

### 1.1 Central Hub is now the only money-in rail

- Removed the direct Stripe/PayPal create/verify/refund fallback from `PaymentProviderService`. If `MCOM_PAY_ENABLED=false` or the HMAC secret is missing, payment routes fail closed instead of silently using the mall's merchant accounts.
- Removed the direct Stripe/PayPal webhook endpoints. `POST /api/v1/payments/mcom/webhook` is the only payment webhook.
- The Stripe SDK instance is retained **only** for outbound business payouts (transfers), never for customer charges.
- Removed the dead `SolutionsPaymentProxyService` from `PaymentsModule`; it is no longer injectable/active.

### 1.2 Charge verification is now bound to the payer and business event

`McomPayService.verifySettledCharge()` now checks:

- `status === 'paid'`
- exact amount in minor units
- exact currency
- payment method (`stripe` / `paypal` / `wallet`)
- `externalCustomerId` matches the authenticated mall user (when Central returns it)
- `mcomUserId` matches the expected central wallet (when provided)
- `reference` matches the business reference prefix (when provided)

It is the single choke point used by order, checkout, membership, booking, gift card, voucher, coupon, campaign, PAYG/money-engine, wallet top-up and admin records.

### 1.3 One charge can only fund one business event

New table `payment_allocations`:

- `UNIQUE (mcomChargeId)`
- `UNIQUE (purpose, entityType, entityId)`

`McomPayService.allocate()` is idempotent for the **same** entity and returns `409 CHARGE_ALREADY_USED` when a charge is reused for a different one. Allocation happens inside the same DB transaction as the order/booking/membership/purchase where possible.

New unique links were added to:

- `order_payments.mcomChargeId`
- `membership_payments.mcomChargeId`
- `payment_histories.mcomChargeId`
- `service_payments.mcomChargeId`

### 1.4 Local ledger / record-keeping

- Expanded `mcom_pay_charges` with `appClientId`, `feeMinor`, `netMinor`, `refundedMinor`, `description`, `mcomUserId`, `externalCustomerId`, `provider`, `walletDebitAmount`, `paidAt`, plus indexes on `reference` and `mcomUserId`.
- Added `mcom_pay_webhook_events` as a durable, hash-unique inbox. Replays are processed once and the raw payload is retained.
- MCOM Pay webhook now upserts the charge, updates the local payment row, and completes an allocated order (`PENDING → COMPLETED`) as a backstop.
- Local payment rows now store the MCOM charge id, provider ref, fee, net and status where available.
- `recordCharge` no longer silently discards failures silently at `debug` level; it logs an error so the reconciler can repair the mirror.
- Admin transaction stats now report real MCOM fees and refund counts (instead of hardcoded `0`), and transaction rows show the recorded fee.

### 1.5 Payment lifecycle fixes

- **Paid orders now become `COMPLETED`** after a verified checkout (previously they stayed `PENDING` forever).
- `/checkout/complete` now writes an `OrderPayment` row, allocates the charge, and is idempotent for an already-completed order.
- `/order/checkout` returns the existing order when the same charge is replayed, instead of refunding the first order's charge.
- Compensating refunds on order DB failure now cover **all** methods (card, PayPal, wallet), not only wallet.
- Booking payment totals now include price-reducer and money-voucher deductions, so those bookings can verify.
- Booking / membership / gift card / voucher / coupon replay paths return the existing entitlement for the same charge instead of throwing or double-creating.
- `POST /digital-value/consumer/:id/fund` was removed. Instruments can only be funded internally by a flow that has already verified payment.
- Removed the `viaSolutions` bypass from `/payments/record`; removed `viaSolutions` from `RecordPaymentDto`.
- `/payments/record` now resolves the server price for plan purchases, verifies the charge, writes the charge id/fee/net, and allocates the charge.
- `/payments/stripe/create-intent` and `/payments/paypal/create-order` now require a plan reference for membership charges; one-off product/PAYG flows must send `purpose: PAYG_TOPUP`.

### 1.6 Wallet handling

- **Pre-authorise, then settle through MCOM Pay.** Checkout, membership, booking, gift card, voucher, coupon, campaign and PAYG wallet flows place an MCOM Wallet **hold** at initiate. At confirmation the hold is released and a **MCOM Pay `method: wallet` charge** is created, so wallet spends appear in the MCOM Pay ledger with fee/net and are protected by the same idempotency/allocation rules as card/PayPal.
- Abandoned attempts auto-expire instead of stranding a debit.
- The wallet UIs state that wallet payments are processed by MCOM Pay and MCOM's standard processing fee applies.
- **Top-ups are deep-linked to MCOM Central.** The in-app card top-up form is gone; `FundWallet` and `WalletTopUpPanel` open Central's wallet page instead of crediting Central's wallet from mall funds.
- Wallet top-ups that still use the legacy endpoint record the Central wallet transaction id, allocate the MCOM Pay charge, and **no longer mirror the spendable balance into the local wallet**. Central is the single spendable balance; the local wallet remains an earnings/audit ledger.
- Wallet funding is bounded to £10–£500, matching the top-up proxy.

### 1.7 Frontend / admin

- Stripe card forms now use **only** `NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY` (Central's Stripe account); the mall-key fallback was removed from customer payment components.
- PayPal components now support MCOM Pay's official `approvalUrl` and redirect to PayPal; browser-side `actions.order.capture()` was removed everywhere.
- Wired `approvalUrl` through checkout, membership, bookings, gift cards, vouchers, coupons, campaigns, deals/PAYG, wallet funding and reload flows.
- Customer checkout and membership now surface a **Top up MCOM Wallet** button on insufficient balance.
- Removed the fake card form that stored raw PAN/expiry in `localStorage`; the payment-method page now links to Central's wallet/payment management and states that card data is never stored.
- Billing page no longer reads a fake card from `localStorage`, uses `£`, and no longer claims auto-renewal.
- Invoices page uses real `payment_history` data, exports a real CSV, and no longer hardcodes `paid` fabricated descriptions.
- Wallet withdrawal page no longer shows fabricated bank accounts/history; it directs users to Central.
- Admin checkout now:
  - creates a Stripe intent / PayPal order,
  - uses the lower-case `PaymentMethod` enum expected by the API,
  - passes `clientSecret`, `orderID` and `approvalUrl`,
  - uses `/order/checkout` (with `directPurchase`) instead of the `POST /order` stub.
- Admin pricing now reads the live `/plans` catalog, sends `planVariantId` + `purpose: MEMBERSHIP`, grants the selected plan on success, and loads the publishable key from `GET /payments/config`. The hardcoded `pricingData.ts` and its marketing components were deleted.
- Admin pricing also offers the free trial through `/membership/join-trial` instead of a fake £1 trial charge.
- Added `GET /api/v1/payments/config` returning `{ mcomPayEnabled, publishableKey, walletEnabled, topUpUrl, paypalMode, currency }`.

### 1.8 Recurring billing (implemented)

- `Membership` now stores `autoRenew`, `renewalStatus`, `nextChargeAt`, `renewalAttempts`, `lastRenewalAt`, `renewalAmount`, `renewalCurrency`, `renewalMethod`.
- New `membership_renewals` table records one row per renewal period (paid/failed/canceled, transaction id, failure reason, attempt).
- `MembershipRenewalService` runs daily at 02:00 UTC and:
  - charges the central MCOM Wallet via `POST /wallet/partner/debit` with `category: SUBSCRIPTION`;
  - uses a deterministic per-period key `${clientId}-sub-${membershipId}-${period}`;
  - extends the plan using the variant's duration rule (Standard +90d, Pro +180d, Pro+ +1 calendar year);
  - dunning: retry +1d, +3d, +7d; after the 4th failure it cancels auto-renew and marks the plan canceled if expired.
- Purchase automatically enables auto-renew only when the user has a linked central wallet; card/PayPal recurring is not attempted because MCOM Pay is one-time and stores no partner mandate.
- Customer API: `GET /membership/renewal`, `PATCH /membership/renewal { autoRenew }`.
- Customer subscription dashboard shows auto-renew state, next charge date, past-due state, and a cancel/enable action.
- Migration backfills existing active memberships that have a linked central wallet.

### 1.9 Migrations

- `apps/mcom_mallAPI/src/database/migrations/1799500000000-HardenPaymentLedger.ts`
  - expands `mcom_pay_charges`
  - creates `payment_allocations` and `mcom_pay_webhook_events`
  - adds charge-link columns and unique indexes to order/membership/payment-history/service-payment rows
- `1799600000000-AddMembershipRenewals.ts`
  - recurrence columns on `memberships`
  - `membership_renewals` audit table
- `1799700000000-BackfillMembershipRenewals.ts`
  - opts existing active memberships with a linked wallet into auto-renew

All three were applied successfully to the local database.

---

## 2. Deploy steps

1. Run the migrations (all three have already been applied locally):
   ```bash
   cd apps/mcom_mallAPI
   pnpm migration:run
   ```
   This also installs/uses `@nestjs/schedule` for the daily renewal job.
2. Confirm env (server-side only):
   - `MCOM_SOLUTIONS_URL`
   - `MCOM_CLIENT_ID`
   - `MCOM_HMAC_SECRET`
   - `MCOM_WEBHOOK_SECRET`
   - `MCOM_PAY_ENABLED=true`
   - `MCOM_WALLET_ENABLED=true`
   - `MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY`
   - `MALL_FRONTEND_URL` / `FRONTEND_URL` (used to build PayPal return URLs)
3. In MCOM Console → your app:
   - set the Webhook URL to `https://<api-host>/api/v1/payments/mcom/webhook`
   - re-check the app HMAC secret matches `MCOM_HMAC_SECRET`
   - re-check the webhook secret matches `MCOM_WEBHOOK_SECRET`
4. Frontends:
   - set `NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY` (customer + admin)
   - set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` only if any legacy SDK path remains reachable
   - remove `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (no longer used for charges)
5. Smoke test with Stripe test card `4242 4242 4242 4242`, a PayPal sandbox buyer, and a funded MCOM Wallet:
   - one card order → order `COMPLETED`, charge + allocation + fee/net stored
   - one PayPal membership → redirect → confirm → membership
   - one wallet checkout → hold → capture on complete; abandon a second attempt and confirm the hold is released/expired
   - replay the same charge id on a second order → `409`, no second entitlement
   - send a duplicate signed webhook → processed once

---

## 3. Verification performed

- `apps/mcom_mallAPI`: `tsc --noEmit` ✅
- `apps/McomMall`: `tsc --noEmit` ✅
- `apps/McomMallAdmin`: `tsc --noEmit` ✅
- API tests: **28 suites / 203 tests passed** (dead Solutions proxy spec removed)
- New security tests in `src/resources/payments/services/mcom-pay.service.spec.ts`:
  - payer binding
  - amount mismatch
  - method mismatch
  - idempotent allocation
  - charge reuse rejection

---

## 4. Remaining items

1. **Wallet fee disclosure:** implemented in the wallet payment UIs (checkout, membership, bookings). Confirm the exact fee wording with Central if you want the percentage shown dynamically.
2. **Top-ups:** deep-linked to MCOM Central (implemented).
3. **Recurring:** implemented for wallet-paid mall plans; card/PayPal recurring still requires a customer mandate and is intentionally not attempted.
4. **Payouts / withdrawals:** intentionally left alone per your instruction. They still use mall-owned Stripe/PayPal and withdrawals are not executed automatically.
5. **PayPal return URL contract:** the backend sends `returnUrl`/`cancelUrl` in charge metadata. Confirm with Central that its PayPal order creation honours them; otherwise entitlement waits for the webhook/mall return.
6. **Admin plan prices:** now driven by `/plans`; hardcoded pricing components were deleted.
7. **Dead code:** deleted (Solutions proxy, `service/payment`, `stripe-provider`, dead coupon reload/purchase modals, orphan marketing-membership page, admin PayPal wrapper/success dialogs/payment hooks/wallet service, admin hardcoded pricing data/components).
8. **Reconciliation job:** schema + admin fee/refund reporting are in place; the daily `GET /app-payments/charges` reconciliation job is still a follow-up (separate from the membership renewal cron).

---

## 5. Key files changed

**API**
- `payments/services/mcom-pay.service.ts`
- `payments/services/payment-provider.service.ts`
- `payments/services/payments.service.ts`
- `payments/services/wallet-topup-proxy.service.ts`
- `payments/controllers/payments.controller.ts`
- `payments/controllers/payments-webhook.controller.ts`
- `payments/entities/*`
- `payments/payments.module.ts`
- `database/migrations/1799500000000-HardenPaymentLedger.ts`
- `order/order.service.ts`, `order/entities/order-payment.entity.ts`
- `checkout/checkout.service.ts`
- `membership/membership.service.ts`, `membership/entities/membership-payment.entity.ts`
- `booking/booking.service.ts`, `booking/entities/service-payment.entity.ts`
- `gift-card/gift-card.service.ts`
- `voucher/voucher.service.ts`
- `coupon/coupon.service.ts`
- `campaign-cashback/campaign-cashback.service.ts`
- `money-engine/money-engine.service.ts`
- `wallet/wallet.service.ts`
- `digital-value/controllers/digital-value-consumer.controller.ts`
- `admin/services/transactions.admin.service.ts`, `admin/admin.module.ts`

**Customer app**
- checkout, pricing/membership, wallet funding/withdraw, gift cards, vouchers, coupons, campaigns, deals, bookings, reload
- `components/PayPalCheckoutButton.tsx`, `PayPalButtonWrapper.tsx`, `StripeCheckoutForm.tsx`, `client-provider.tsx`
- settings billing/invoices/payment-method

**Admin app**
- checkout client/form, pricing checkout, PayPal/Stripe components, payment hooks/types, order hook/types
