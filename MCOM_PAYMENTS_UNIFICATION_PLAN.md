# MCOM Mall — Payment Unification Plan

**Date:** 2026-11-21
**Scope:** Remove the duplicated payment orchestration/UI identified in the audit.
**Companion docs:** `MCOM_CENTRAL_PAYMENTS_AUDIT.md`, `MCOM_PAYMENTS_FIXES_APPLIED.md`

---

## Implementation status (2026-11-21)

| Workstream | Status |
|---|---|
| Backend: one `PaymentOrchestratorService` for all rails | ✅ Done — all 11 feature modules migrated |
| Backend: guard against direct provider calls | ✅ Done — `scripts/check-payment-boundaries.js` + `check:payment-boundaries` script |
| Backend: dead `/checkout/*` module removed | ✅ Done |
| Backend: duplicate wallet funding removed | ✅ Done — one public path (`/wallet/fund/*`); unused `/payments/wallet/topup/initiate|confirm` removed; webhook backstop kept and idempotency aligned |
| Backend: duplicate membership front doors | ✅ Done — generic intent/order/record routes delegate to `MembershipService` |
| Frontend: shared Stripe/PayPal/error primitives | ✅ Done — `packages/payments` (`@mcommall/payments`) consumed by both apps |
| Frontend: shared payment state machine | ✅ Added `usePaymentFlow`; adopted by gift card, voucher, coupon, booking, gift-card reload, membership card panel |
| Frontend: remaining bespoke flows | ⏳ Checkout (Stripe redirect recovery), pricing PAYG, campaigns, money-engine, and admin checkout/pricing still use the shared primitives but keep their own bespoke step logic |

**Verification:** API `tsc --noEmit` passes; payment/wallet/money-engine Jest suites pass (60 tests); both Next apps typecheck and `next build --webpack` succeeds; payment boundary guard passes. Two unrelated pre-existing suites (`customer.service.spec`, `sso.service.spec`) remain red for missing providers/ESM transform, not payments.

**Deviation from the plan:** the canonical wallet route is `/wallet/fund/*` (the one the UI actually uses and the one that supports Stripe + PayPal), not `/payments/wallet/topup/*`. The unused duplicate endpoints/hooks were deleted instead.

---

## 0. Objective

Today the **money-transport layer is already centralized** (`PaymentsModule` →
`PaymentProviderService` → `McomPayService` / `McomWalletService`). What is *not*
centralized is everything around it:

| Problem | Current state | Target state |
|---|---|---|
| Business payment orchestration | `if (wallet) / if (stripe) / else (paypal)` duplicated in 11 modules | One `PaymentOrchestratorService.initiate/confirm/refund` |
| Wallet funding | `/wallet/fund/*` **and** `/payments/wallet/topup/*` | One canonical route, the other delegates then is deleted |
| Membership purchase | `/membership/initiate-payment` + `/verify-payment` **and** `/payments/stripe|paypal/*` + `/payments/record` | One canonical pair; generic routes delegate |
| Payment UI primitives | `StripeCheckoutForm` / `PayPalCheckoutButton` re-implemented in customer **and** admin | One shared `@mcommall/payments` package |
| Payment UI flows | ~15 per-product modals/pages, each with its own state machine | One `usePaymentFlow` hook + thin per-product wrappers |
| Dead flow | `/checkout/initiate` + `/checkout/complete` unused by any frontend | Deleted |

**Non-goals (this plan):** changing MCOM Pay contract, migrating payouts off
Stripe/PayPal, redesigning invoices/receipts, or changing pricing/ledger
semantics. Those stay as-is.

**Guiding rule:** move *code*, not *money*. Every phase must keep the existing
request/response DTOs working until the frontend is migrated, then remove the
old surface behind a verified rollout.

---

## 1. Current duplication map

### 1.1 Backend — 11 modules re-implement the same dispatch

| # | Module | Initiate method | Verify method | Wallet style | Local ledger |
|---|---|---|---|---|---|
| 1 | `order/order.service.ts` | `createCheckoutPaymentIntent:503`, `checkout` | `completeCheckoutPaymentIntent:654` | **charge** (`createWalletCharge:1848`) | `orders`, `order_payments` |
| 2 | `checkout/checkout.service.ts` | `initiateCheckout:79` | `completeCheckout:572` | hold | `mcom_payment_intents` (**dead**) |
| 3 | `booking/booking.service.ts` | `initiatePayment:1560` | `verifyPayment:2029` | hold/charge | `service_payments` |
| 4 | `membership/membership.service.ts` | `initiateMembershipPayment:353` | `verifyAndCreateMembership` | hold | `membership_payments` |
| 5 | `gift-card/gift-card.service.ts` | `initiateGiftCardPurchase:416`, `initiateReload` | `verifyAndCompletePurchase:534` | hold | orders + gift card |
| 6 | `voucher/voucher.service.ts` | `initiateVoucherPurchase:346`, `initiateReload` | `verifyAndCompletePurchase:459` | hold | orders + voucher |
| 7 | `coupon/coupon.service.ts` | `initiateCouponPurchase:1250`, `initiateReload` | `verifyAndCompleteCouponPurchase:1404` | hold | `order_payments` |
| 8 | `money-engine/money-engine.service.ts` | `initiatePurchase:634`, `initiateContribution` | `verifyPayment:1059` | hold | `payment_histories` |
| 9 | `wallet/wallet.service.ts` | `initiateWalletFunding:703` | `verifyAndCompleteFunding` | card/PayPal | `wallets`, `wallet_transactions` (legacy) |
| 10 | `payments/wallet-topup-proxy.service.ts` | `initiateTopUp:53` | `confirmTopUp:111` | card | Central wallet only |
| 11 | `campaign-cashback/campaign-cashback.service.ts` | `initiateContribution` | `contribute` | hold | `order_payments` |

Plus `payments/payments.service.ts` exposes the **generic** front door
(`/payments/stripe/create-intent`, `/payments/paypal/create-order`,
`/payments/record`) that overlaps with #4.

### 1.2 Frontend — per-product flows

**Customer (`apps/McomMall`)**

| Flow | Orchestrator | Ends up calling |
|---|---|---|
| Cart / buy-now | `app/(public)/checkout/**`, `hooks/useCheckout.ts` | `/order/payment-intent`, `/order/checkout` |
| Membership | `app/pricing/components/PricingCheckoutClient.tsx`, `MembershipCardPanel.tsx`, `WalletTopUpPanel.tsx` | `/payments/stripe|paypal/*`, `/payments/record` |
| Gift card buy/reload | `components/gift-card/PaymentModal.tsx`, `dashboard/history/gift-card/.../ReloadModal.tsx` | `/gift-cards/purchase(+verify)`, `/:code/initiate-reload` |
| Voucher buy/reload | `listings/[id]/components/VoucherPurchaseModal.tsx`, `.../ReloadVoucherModal.tsx` | `/vouchers/initiate-purchase`, `/:code/initiate-reload` |
| Coupon buy/reload | `listings/[id]/components/CouponPurchaseModal.tsx` | `/coupons/initiate-purchase` |
| Booking | `components/BookingPaymentModal.tsx` | `/bookings/initiate-payment`, `/verify-payment` |
| Wallet (legacy) | `app/reload/components/ReloadCard.tsx` | `/wallet/fund/initiate|verify` |
| Wallet top-up (new) | `app/pricing/components/WalletTopUpPanel.tsx` | `/payments/wallet/topup/initiate|confirm` |
| Campaign contribution | `dashboard/cashback/.../CampaignUnlockModal.tsx`, `dashboard/deals/.../ContributeModal.tsx` | `/campaign-cashback/:id/contribute(/initiate)` |
| Money engine | `service/money-engine/index.ts` | `/money-engine/purchase(/initiate)` |

**Admin (`apps/McomMallAdmin`)**

| Flow | Orchestrator | Duplicate of |
|---|---|---|
| Checkout | `app/checkout/**`, `hooks/useCheckout.ts`, `hooks/useRecordOrder.ts` (two wrappers, same endpoint) | customer checkout |
| Pricing / membership | `app/pricing/components/PricingCheckoutClient.tsx` | customer pricing |
| Gift card | `service/hooks/useGiftCardPayment.ts` | customer gift card |
| Coupon products | `service/coupon-products/hooks.ts` | customer coupon |

**Shared primitives are copied, not shared:**
`components/StripeCheckoutForm.tsx` and `components/PayPalCheckoutButton.tsx`
exist in both apps and have already diverged. `packages/` does not exist even
though `pnpm-workspace.yaml` already includes `packages/*`.

---

## 2. Target architecture

```
                       ┌──────────────────────────────┐
  Customer UI ────────►│  @mcommall/payments (shared) │◄──────── Admin UI
                       │  PaymentMethodSelector        │
                       │  StripeCheckoutForm           │
                       │  PayPalCheckoutButton         │
                       │  usePaymentFlow()             │
                       └──────────────┬───────────────┘
                                      │  initiate / confirm
                                      ▼
                       ┌──────────────────────────────┐
                       │  API feature modules         │
                       │  (order, booking, gift-card, │  ← only domain logic:
                       │   voucher, coupon, member…)  │    price, record, grant
                       └──────────────┬───────────────┘
                                      │  orchestrate(method, …)
                                      ▼
                       ┌──────────────────────────────┐
                       │  PaymentOrchestratorService  │  ← NEW: single dispatch
                       │  initiate() confirm() refund()│
                       └──────────────┬───────────────┘
                                      │
                       ┌──────────────┴───────────────┐
                       ▼                              ▼
                 McomPayService                McomWalletService
                       │                              │
                       └────────────► Central Hub ◄────┘
```

**Seam:** feature modules keep *domain* responsibility (server-side price,
idempotency key, local record, granting the product). The orchestrator owns
*rail* responsibility (wallet hold vs charge, Stripe intent, PayPal order,
verification, refund). This is the only seam that removes duplication without
merging unrelated business rules.

---

## 3. Phase 0 — Safety net (before any edit)

1. Add integration tests around the **contract** of each current endpoint
   (request → provider call → local record → response). Minimum set:
   - `order.checkout` for wallet / stripe / paypal
   - `booking.initiatePayment` + `verifyPayment`
   - `membership` verify (wallet hold + card)
   - `gift-card` purchase + verify
   - `voucher` + `coupon` purchase + verify
   - wallet top-up (both routes)
2. Snapshot the provider calls with a fake `McomPayService` (record
   `amountMinor`, `method`, `reference`, `idempotencyKey`, `metadata`, `splits`).
3. Add a lint rule/test that fails if a feature module imports
   `McomPayService` or `McomWalletService` directly (only `payments/*` may).
4. Run `pnpm --filter @mcommall/api typecheck` and `test` as the baseline.

**Exit criteria:** green baseline; a provider-call contract test exists for
every flow above.

---

## 4. Phase 1 — `PaymentOrchestratorService` (backend)

New file: `apps/mcom_mallAPI/src/resources/payments/services/payment-orchestrator.service.ts`
registered in `PaymentsModule` and exported.

### 4.1 Public API

```ts
export type PaymentRail = 'stripe' | 'paypal' | 'mcom_wallet';

export interface PaymentPayer {
  mallUserId: string;          // JWT subject
  centralUserId?: string | null;
}

export interface InitiatePaymentInput {
  rail: PaymentRail;
  amount: number;              // major units (GBP)
  currency: string;            // 'GBP'
  payer: PaymentPayer;
  /** Frozen business context, stored on the charge. */
  metadata: Record<string, any>;
  /** Deterministic per business event; caller still owns this. */
  idempotencyKey: string;
  reference: string;
  description?: string;
  /** Wallet only: reserve (hold) or debit now. Default 'hold'. */
  walletMode?: 'hold' | 'charge';
  /** Optional seller/platform splits (existing `McomPaySplit[]`). */
  splits?: McomPaySplit[];
  intent?: McomPayIntent;
}

export type InitiatePaymentResult =
  | { rail: 'stripe';     chargeId: string; clientSecret: string; amount: number }
  | { rail: 'paypal';     chargeId: string; orderId: string; approvalUrl: string | null; amount: number }
  | { rail: 'mcom_wallet';chargeId?: string; holdId: string; expiresAt?: string; amount: number };

export interface ConfirmPaymentInput {
  rail: PaymentRail;
  /** Provider handle from the browser: intent id, order id, or hold/transaction id. */
  reference: string;
  amount: number;
  currency: string;
  payer: PaymentPayer;
  /** domain tag used for audit + replay protection */
  purpose: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentResult {
  ok: boolean;
  chargeId: string | null;      // MCOM charge id
  providerRef: string | null;
  feeMinor: string | null;
  netMinor: string | null;
  transactionId: string;        // stable reference for local ledger
  raw?: any;
}

export interface RefundPaymentInput {
  rail: PaymentRail;
  reference: string;
  amount?: number;
  reason?: string;
}
```

### 4.2 Behaviour

`initiate()`
- `stripe` → `paymentProvider.createStripePaymentIntent(...)`; return `clientSecret`.
- `paypal` → `paymentProvider.createPaypalOrder(...)`; return `orderId`, `approvalUrl`.
- `mcom_wallet` + `walletMode: 'hold'` → `createWalletHold(...)`.
- `mcom_wallet` + `walletMode: 'charge'` → `createWalletCharge(...)`.
- One place builds the wallet idempotency key via `buildWalletKey(...)`.

`confirm()`
- `stripe` → `verifyStripePaymentIntent(...)`.
- `paypal` → `captureAndVerifyPaypalOrder(...)`.
- `mcom_wallet` → `settleWalletReference(...)` (accepts hold or charge reference).
- Then, if `entityId` is present, call `allocateCharge(...)` **once** so a paid
  charge can never complete two domain records.

`refund()`
- `stripe` → `refundStripePayment(...)`.
- `paypal` → `refundPaypalOrder(...)`.
- `mcom_wallet` → wallet release/refund path.
- Used by every module's existing failure handler; no per-module branching.

### 4.3 Migration order

Migrate in this order (lowest risk → highest). Each step: replace the local
dispatch with an orchestrator call, keep DTOs unchanged, run the contract test.

| Step | File | Replace |
|---|---|---|
| 1 | `gift-card/gift-card.service.ts` | initiate/reload dispatch, verify, refund |
| 2 | `voucher/voucher.service.ts` | same |
| 3 | `coupon/coupon.service.ts` | same |
| 4 | `campaign-cashback/campaign-cashback.service.ts` | initiate + contribute verify |
| 5 | `money-engine/money-engine.service.ts` | initiate/verify/contribute |
| 6 | `booking/booking.service.ts` | initiate/verify/refund/webhook |
| 7 | `membership/membership.service.ts` | initiate/verify |
| 8 | `order/order.service.ts` | payment-intent/checkout/refund |
| 9 | `wallet/wallet.service.ts` + `wallet-topup-proxy.service.ts` | funding (see Phase 2) |
| 10 | `payments/payments.service.ts` | generic intents/record |
| 11 | `checkout/checkout.service.ts` | delete (Phase 2) |

### 4.4 What does **not** move

- Price computation, variant resolution, quote building.
- Idempotency-key *identity* (e.g. `coupon-hold:<product>:<user>:<key>`), which
  is domain knowledge.
- Local ledger writes and product granting.
- Webhook listeners (they keep calling the domain verify method; the domain
  method now calls `orchestrator.confirm`).

**Exit criteria:** `rg "createStripePaymentIntent|createPaypalOrder|createWalletHold|verifyStripePaymentIntent|captureAndVerifyPaypalOrder" apps/mcom_mallAPI/src/resources --glob '!payments/**'`
returns nothing. Provider-call contract tests still pass.

---

## 5. Phase 2 — Collapse duplicate front doors (backend)

### 5.1 Wallet funding → one canonical flow

**Canonical:** `/payments/wallet/topup/initiate` + `/confirm`
(reason: credits the Central wallet only, resolves the charge id server-side,
amount re-read from the charge).

1. Make `/wallet/fund/initiate|verify` thin delegations to
   `WalletTopUpProxyService` (same request shape accepted), so old clients keep
   working during rollout.
2. Migrate customer `app/reload/components/ReloadCard.tsx` to the canonical
   endpoints.
3. Stop writing a local spendable balance in the legacy path (already only an
   audit row).
4. Delete `WalletController.fund/*`, `WalletService.initiateWalletFunding`,
   `verifyAndCompleteFunding`, `useInitiateFund`, `useVerifyFund` after one
   release.

**Watch-outs:** min/max differ (legacy 10–500, new 5–500). Standardise to
5–500 and enforce server-side only.

### 5.2 Membership → one canonical flow

**Canonical:** `/membership/initiate-payment` + `/membership/verify-payment`
(reason: owns plan resolution, wallet hold capture, membership creation and
charge allocation).

1. Turn `/payments/stripe/create-intent`, `/payments/paypal/create-order` and
   `/payments/record` into delegating wrappers:
   - intents/orders for `purpose=MEMBERSHIP` → `MembershipService.initiate...`
   - `record` for `purpose=MEMBERSHIP` → `MembershipService.verify...`
   (this is already mostly true for `record`; do the same for intents).
2. Migrate customer + admin pricing UIs to the membership endpoints.
3. Keep the generic routes only for genuine one-off/PAYG use, or delete them if
   no caller remains.
4. Remove duplicate price tables in admin `pricingData.ts`; resolve from
   `planVariantId` (already supported server-side).

### 5.3 Delete the dead checkout module

`apps/mcom_mallAPI/src/resources/checkout/**` is referenced by no frontend.
After confirming no external client calls `/checkout/initiate|complete`, delete
the module, its DTOs, spec and `app.module.ts` registration.

**Exit criteria:** one wallet-funding route and one membership route remain
(the legacy ones deleted, not just deprecated).

---

## 6. Phase 3 — Shared frontend package `@mcommall/payments`

### 6.1 Package layout

```
packages/payments/
  package.json          # name @mcommall/payments, peer deps react/@stripe/react-stripe-js/@paypal/react-paypal-js
  tsconfig.json
  src/index.ts
  src/types.ts          # PaymentRail, Initiate/Confirm DTOs, result unions
  src/components/PaymentMethodSelector.tsx
  src/components/StripeCheckoutForm.tsx     # moved from customer, one version
  src/components/PayPalCheckoutButton.tsx   # moved from customer, one version
  src/components/PaymentSuccessDialog.tsx
  src/hooks/usePaymentFlow.ts               # initiate → render → confirm state machine
  src/lib/payment-errors.ts
```

### 6.2 Build wiring

- `pnpm-workspace.yaml` already lists `packages/*`; create the folder and run
  `pnpm install` to link.
- In **both** Next apps, add to `tsconfig.json`:
  `"paths": { "@mcommall/payments": ["../../packages/payments/src"] }`
  (keep `@/*`).
- In both `next.config.*`, add:
  `transpilePackages: ['@mcommall/payments']`.
- Move `@stripe/*`, `@paypal/*` to the package's peer deps (already installed in
  apps).

### 6.3 `usePaymentFlow` contract

```ts
const flow = usePaymentFlow({
  rail,
  amount,
  currency,
  purpose,
  entityId,
  idempotencyKey,
  initiate: (input) => api.post(endpoint, input),  // domain endpoint
  confirm:   (input) => api.post(endpoint, input),
  onSuccess: (result) => void,
});
// flow.status: 'idle' | 'initiating' | 'awaiting_provider' | 'confirming' | 'done' | 'error'
// flow.handle: the initiate result (clientSecret / approvalUrl / holdId)
// flow.error: normalized via getPaymentErrorInfo
```

Per product, the modal becomes a thin shell:

```tsx
<PaymentFlowModal
  purpose="GIFT_CARD"
  amount={amount}
  endpoints={{ initiate: '/gift-cards/purchase', confirm: '/gift-cards/purchase/verify' }}
  onSuccess={refresh}
/>
```

### 6.4 Flow migration order

1. Gift card (customer) — simplest, already isolated.
2. Voucher, coupon (customer) — share the listing purchase pattern.
3. Booking (customer).
4. Checkout (customer), then admin checkout.
5. Membership (customer + admin).
6. Wallet top-up (canonical route) + delete legacy reload UI.
7. Campaign + money-engine — wrap with `usePaymentFlow`, keep their endpoints.

Delete both apps' local `components/StripeCheckoutForm.tsx`,
`components/PayPalCheckoutButton.tsx`, `lib/payment-errors.ts` after migration.
Collapse admin `useCheckout` + `useRecordOrder` into one.

**Exit criteria:** one implementation each of Stripe form, PayPal button,
payment-error mapping, and payment state machine; no app-local copies.

---

## 7. Phase 4 — Webhooks & reconciliation convergence

- Keep one webhook (`POST /payments/mcom/webhook`).
- Route events through `PaymentOrchestratorService` context instead of each
  listener re-verifying independently where possible; listeners stay as the
  domain-completion hook.
- Ensure every `confirm()` path calls `allocateCharge` exactly once (replay
  protection becomes structural, not per-module).
- Point the admin transactions/billing screens at the unified
  `mcom_pay_charges` + `payment_allocations` data (no `totalFees: 0`).

---

## 8. Testing strategy

| Layer | Test |
|---|---|
| Orchestrator | unit tests for each rail (initiate/confirm/refund), idempotency reuse, wallet hold vs charge, allocation once |
| Feature modules | contract tests with a fake provider asserting exact `method`, `amountMinor`, `reference`, `idempotencyKey`, `metadata`, `splits` |
| Duplicate-route parity | same request to legacy + canonical produces the same provider call and ledger row |
| Frontends | component test: selecting a rail renders the right widget; success/error transitions |
| End-to-end (manual) | matrix: {wallet, card, PayPal} × {checkout, membership, gift card, voucher, coupon, booking, top-up, campaign} |

Add a CI guard (ESLint `no-restricted-imports`) so feature modules can no longer
import `McomPayService`/`McomWalletService` directly.

---

## 9. Rollout & rollback

- **Flags:** `PAYMENTS_ORCHESTRATOR_ENABLED` (backend) — when off, old dispatch
  runs; when on, orchestrator runs. Remove after one clean release.
- **Frontends:** ship the shared package behind a per-flow flag; keep the old
  modal mounted until the new one is verified in staging.
- **Rollback:** flags revert behaviour without a redeploy; DB is untouched
  (no schema change required by this plan).
- No migration needed: unified records already exist
  (`mcom_pay_charges`, `payment_allocations`, `mcom_payment_intents`).

---

## 10. Sequencing & effort

| Phase | Work | Estimate |
|---|---|---|
| 0 | Contract tests + CI import guard | 1–2 days |
| 1 | `PaymentOrchestratorService` + 11 module migrations | 5–7 days |
| 2 | Wallet/membership convergence + delete dead checkout | 2–3 days |
| 3 | Shared `@mcommall/payments` + 15 flow migrations | 6–8 days |
| 4 | Webhook/admin data convergence | 2 days |
| — | Full manual payment matrix | 2 days |

Suggested PR slicing (each independently shippable):
1. Orchestrator + gift-card/voucher/coupon.
2. Booking + campaign + money-engine.
3. Membership + order + wallet, then Phase 2 deletions.
4. `@mcommall/payments` package + customer flows.
5. Admin flows + delete duplicates.
6. Webhook/admin reporting.

---

## 11. Definition of done

- [ ] No feature module imports `McomPayService`/`McomWalletService`.
- [ ] No `if (rail === 'stripe')` dispatch outside `PaymentOrchestratorService`.
- [ ] Exactly one wallet-funding route and one membership route.
- [ ] `packages/payments` is the only implementation of Stripe/PayPal UI and
      payment errors; both apps consume it.
- [ ] One `usePaymentFlow` state machine used by every payment modal.
- [ ] Provider-call contract tests pass for all rails × all flows.
- [ ] Manual matrix passes on a real MCOM Pay sandbox.
- [ ] Dead `/checkout/*` module removed.

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Behaviour drift in one module's metadata/idempotency | Contract test per flow before migration; keep keys domain-owned |
| Wallet hold vs charge semantics mixed up | Explicit `walletMode`; default `hold`; review order/membership call sites |
| Double allocation / replay | `allocateCharge` inside `confirm()`, unique on charge id |
| Next.js monorepo resolution issues | `transpilePackages` + tsconfig path + lockfile in first PR |
| Big-bang UI breakage | Per-flow flags; migrate one product per PR |
| PayPal approval redirect paths differ | Shared component owns return-URL handling; return page stays per-app |

---

*This plan only moves existing logic behind clearer seams. No provider contract,
pricing rule, or ledger schema changes are required.*
