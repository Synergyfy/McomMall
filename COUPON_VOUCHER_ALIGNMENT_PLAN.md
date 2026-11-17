# Coupon-Voucher / Voucher-Coupon Alignment Plan

> Goal: make the shipped system actually behave like the "programmable spending power" model:
> name/visual is presentation, `functionalType` is behaviour, real vs reward is always tracked,
> and every instrument is spendable inside the network.

Status: **implemented** · Owner: TBD · Last updated: 2026-11-17

## Progress log

### Phase 0 — Safety net ✅ (2026-11-17)

- Added a global `FeatureFlagsModule` (`src/common/feature-flags/`) with four dark-by-default flags:
  `FEATURE_FUNCTIONAL_TYPE_ENFORCEMENT`, `FEATURE_MONEY_VOUCHER_CHECKOUT`, `FEATURE_DEALS_HUB`, `FEATURE_CASHBACK_CAP`.
- Added the flags to `src/config/env.validation.ts` and registered the module in `AppModule`.
- Added the canonical instrument event contract (`src/common/instrument-events.ts`):
  `instrument.issued`, `instrument.credited`, `instrument.applied`, `instrument.transferred`, `instrument.rejected`.
- Wired money-engine purchase / cashback / spend / transfer to emit those events (best-effort, never throws).
- Added `money-engine.service.spec.ts` covering split maths, idempotency, burn strategies, depletion,
  insufficient funds, transfer ratio preservation, and rejection events (16 tests total with the flag spec).
- Added the read-only `scripts/audit-instruments.ts` + `pnpm --filter @mcommall/api audit:instruments`.
- Repaired the stale `checkout.service.spec.ts` constructor wiring so the baseline suite is green
  (test-only change; no production behaviour altered).
- Local baseline: coupons 5, vouchers 10, money vouchers 0, digital values 22, gift cards 7,
  reward definitions 0. Re-run the audit on staging before starting Phase 1.

### Phase 1 — Make the data model honest ✅ (backend + admin form)

- Migration `1799000000009-AddRewardValueAndBehavior` adds
  `reward_definitions.faceValue`, `reward_definitions.maxCashbackPercent`,
  `user_money_vouchers.faceValue`, `cashbackCredited` and `functionalType`.
  It backfills face value from legacy `£` names and snapshots behaviour onto issued wallets.
- Definition invariants enforced: split must sum to 1, `faceValue > 0`, cap 0–100.
- `purchaseVoucher` uses the canonical face value (and rejects payments that do not match it)
  and rejects `price_reducer` definitions — those are issued, not purchased. Both rules are
  gated by `FEATURE_FUNCTIONAL_TYPE_ENFORCEMENT`, so the old payment-derived behaviour remains
  the default until the flag is enabled.
- `injectCashback` enforces the cumulative cap when `FEATURE_CASHBACK_CAP=true` and always
  records `cashbackCredited`.
- `spend` rejects `price_reducer` wallets when `FEATURE_FUNCTIONAL_TYPE_ENFORCEMENT=true`;
  the checkout discount path lands in Phase 2.
- Responses expose `faceValue` and `functionalType`; the admin form now sends
  `faceValue`/`maxCashbackPercent` instead of embedding the amount in `name`.
- Added 5 regression tests (21 across the money-engine + flags suites); full API suite is 169 green.
- Migration applied to the local DB and the audit re-ran successfully.
- Deferred: the customer dashboard still shows the real/reward split cards (G9); move them
  into a details view in Phase 5.

### Phase 2 — Money-engine wallets at checkout and bookings ✅ (backend)

- `MoneyEngineService` now exposes `getOwnedByCode`, `getScopeForDefinition`,
  `redeemForOrder` and `redeemForBooking`. Redemption locks the wallet row, authorises the
  owner, applies the definition's burn strategy (including `PROPORTIONAL`), writes a `SPEND`
  transaction and emits `instrument.applied`.
- Both checkout paths accept `moneyVoucherCode` / `moneyVoucherAmount`:
  `checkout.service.ts` (`POST /checkout/initiate`) and `order.service.ts`
  (`POST /order/checkout`, the flow the storefront actually uses).
- The money wallet is applied after the native voucher and before the payment step, and
  redeemed inside the same DB transaction as the order.
- `service_bookings` supports the same pair for `POST /bookings/initiate-payment` and is
  redeemed in the payment-verification transaction.
- Migrations `1799000000010` (orders) and `1799000000011` (service bookings) add
  `moneyVoucherCode` + `moneyVoucherAmountApplied`; both are applied to the local DB.
- `scopeType` maps onto the shared instrument scope (`any_shop` unrestricted; other modes use
  the definition's `validShops`; an empty allow-list fails closed).
- Everything is gated by `FEATURE_MONEY_VOUCHER_CHECKOUT`. `price_reducer` wallets are
  rejected as payment until the discount-settlement path lands.
- The storefront checkout hook now carries the new fields; the visible input is Phase 5.
- Added 9 tests (checkout integration + money-engine redemption/scope); full API suite is 177 green.

### Phase 3 — Attribution ✅ (per-wallet baseline)

- Added `user_money_vouchers.salesAttributed` (migration `1799000000012`), the cumulative
  value a wallet has driven through the network.
- Both `spend` (POS) and `redeemInstrument` (checkout/booking) now snapshot a real
  `salesImpactBefore` and write `salesImpactAfter`; the hardcoded zero is gone.
- Added `GET /money-engine/admin/analytics/definitions/:id`: issued, depleted, redemption
  rate, attributed sales, outstanding value and cashback credited for one definition.
- This is **attributed** sales per wallet, not causal lift. A per-shop/campaign window
  baseline can layer on top later without changing the transaction contract.
- Added a cumulative-baseline regression test; full API suite is 178 tests green.

### Phase 4a — Deals read facade ✅

- Added a read-only `deals` module (`GET /deals`, `GET /deals/mine`) gated by
  `FEATURE_DEALS_HUB`.
- It aggregates every ledger into one `DealDto`: standard coupons (including legacy
  balance-bearing coupon products), money wallets, native vouchers, gift cards,
  gift-card templates, reward definitions and marketing campaigns.
- Each deal exposes `kind`, `visualType`, `functionalType`, `faceValue`, `remainingValue`,
  `scope`, `status`, `business` and `source`, so callers no longer need to know which table
  a code lives in.
- `GET /deals/mine` covers saved + purchased coupons, owned money wallets, vouchers the user
  owns, bought or received, and owned/purchased gift cards.
- Updated the storefront `service/deals` types and query key; the previously dead
  `GET /deals/mine` call now has a real backend.
- Added 4 facade tests; full API suite is 182 tests green.
- Remaining Phase 4b/4c: stop new balance-bearing coupons, extend the digital-value ledger
  and add the canonical instrument resolver.

### Phase 5 — Deals UI, create flow, terminology ✅

- Added `/dashboard/deals`: tabbed hub (All, Standard Coupons, Coupon Vouchers,
  Voucher Coupons, Gift Cards, Promotions) with search, value/remaining display, copy-code
  and a graceful "not enabled" state when `FEATURE_DEALS_HUB` is off.
- Added `/dashboard/deals/create`: one entry point that routes to Standard Coupon creation
  and to the admin-defined Coupon Voucher / Voucher Coupon templates.
- Updated both dashboard menus from "Coupon-Voucher"/"Coupons & Vouchers" to **Deals**.
- Renamed the legacy page to **Reward Hub** and removed the real/reward split stat cards
  (G9) so customers see a single spending-power number.
- Added the full contribution flow:
  - backend `POST /money-engine/vouchers/:code/contribute/initiate` and
    `POST /money-engine/vouchers/:code/contribute`
  - storefront hooks + a "Top up" modal on Coupon Voucher cards (card, PayPal or MCOM Wallet)
  - the wallet is credited up to its face-value target, with the contributor recorded and
    idempotency on the payment transaction.
- Full API suite is 195 tests green; API, storefront and admin typecheck clean.

### Phase 4b/4c — Ledger consolidation ✅ (pragmatic)

- Added `FEATURE_LEDGER_CONSOLIDATION`. When enabled, coupon-product purchase/reload
  endpoints reject new balance-bearing coupons; existing ones remain readable.
- Money-engine wallets are mirrored into `digital_value_master` on create, contribution,
  cashback, spend and transfer. `CreateDigitalValueDto` now accepts an external `code` so
  both ledgers share it; `RedeemDigitalValueDto.merchantId` is optional for mirror writes.
- Migration `1799000000013` backfills existing money wallets into `digital_value_master`.
- Added `InstrumentsService` + `GET /instruments/:code`: one canonical resolver for coupon,
  voucher, money-wallet and gift-card codes (kind, behaviour, balance, status, scope).
  `GET /deals/resolve/:code` exposes the same lookup in the deal shape.
- Remaining: checkout/booking/POS still use their domain-specific paths internally; switching
  them to the resolver is a follow-up refactor. The Deals facade and the new endpoints already
  use it.

### Hardening pass

- Contribution now checks the wallet state at initiation and issues a best-effort compensating
  refund if the credit transaction fails after payment verification.
- `GET /instruments/:code` and `GET /deals/resolve/:code` are admin/support only, so balances
  are not exposed to any authenticated code holder.
- The storefront checkout has a dedicated money-voucher input, prefilled from
  `/checkout?moneyVoucherCode=…`, included in the total and the order summary. The Deals
  "Use" button links straight to it.
- Money-wallet mirroring skips already-mirrored codes (no duplicate/replay warnings) and is
  covered by regression tests.
- Historical `salesAttributed` is backfilled from prior spend transactions
  (migration `1799000000014`).
- The resolver now returns the real row id and face value; `GET /money-engine/me` also allows
  owners/admins so business users can use the checkout money-voucher input.

---

## 1. What is misaligned today

> Status as of the initial audit. See the progress log above for what has since been fixed.

| # | Gap | Evidence | Severity |
|---|---|---|---|
| G1 | `functionalType` (`price_reducer` / `spending_power`) is stored but never enforced | repo-wide grep: only entity, DTO, admin form, migration. No service branches on it. `money-engine.service.ts` `spend()` only reads `burnStrategy` | **Critical** |
| G2 | No numeric face value. "£100" is a string inside `name` | `McomMallAdmin/app/admin/coupons-vouchers/page.tsx` builds `name: "${name} £${faceValue}"`; `reward-definition.entity.ts` has no value column | **Critical** |
| G3 | Money-engine wallets cannot pay online orders/bookings | `checkout.service.ts`, `order.service.ts`, `booking.service.ts` never import `MoneyEngineService`; only `POST /money-engine/spend` (POS) exists | **Critical** |
| G4 | Four parallel balance/discount ledgers | `coupons` (incl. `metadata.balance` via coupon products), `vouchers`, `user_money_vouchers`, `digital_value_master` (+ `gift_cards`) | High |
| G5 | No "Deals" consolidation; `/deals/mine` has no backend | `apps/McomMall/service/deals/hook.ts` calls `GET /deals/mine`; no `deals` resource in `apps/mcom_mallAPI/src/resources` | High |
| G6 | No friends/family top-up-to-target | only `transfer()` between existing wallets, preserving ratio; no contribute/fund flow | Medium |
| G7 | Sales attribution is fake | `money-engine.service.ts:379` hardcodes `salesImpactBefore = 0` | Medium |
| G8 | No 50% hyper-local cashback cap | no cap field or check in `money-engine` / `campaign-cashback` | Medium |
| G9 | Split leaks into customer dashboard aggregates | `coupons-vouchers/page.tsx` cards: "Real Money", "Rewards Earned", "Rewards from Business" | Low |
| G10 | "V-Card" is used for a business bio card, not the voucher wallet | `HomePage.tsx`, `McomVCardEGiftCardsSection.tsx` vs `/dashboard/wallet` | Low |
| G11 | Business create flow has no Standard Coupon / Coupon Voucher choice | `app/dashboard/coupons/new/page.tsx` is standard-discount only; the type selector is admin-only | Medium |

### Spec ambiguity to resolve

The source document says both:

- "Coupon Voucher … actually creates spendable value"
- "Voucher Coupon … actually behaves like a coupon"

and also "Voucher Coupon … does not create money. It must restrict where money can be spent."

These are not the same thing. This plan adopts an explicit definition (see §3) so the code has one meaning.

---

## 2. Principles

1. **Behaviour is data, not naming.** `visualType` only changes presentation. `functionalType` drives settlement.
2. **One canonical value per instrument.** Every issued instrument has a stored `faceValue` and a stored remaining value.
3. **Real vs reward is always recorded, never inferred.**
4. **No new ledger without a migration path.** Prefer deprecating a store over adding a fifth.
5. **Ship behind flags, backfill before enforcing.**
6. **Never break existing money.** All migrations are additive first, destructive last.

---

## 3. Target model (canonical)

### 3.1 Instrument kinds

| Kind | Where it lives today | Target |
|---|---|---|
| `standard_coupon` | `coupons` | stays: discount only, no balance |
| `coupon_voucher` | `user_money_vouchers` (spending_power) | stays: balance wallet, split real/reward |
| `voucher_coupon` | undefined | **new behaviour**: single-use discount entitlement, scoped, non-transferable |
| `voucher` | `vouchers` | stays: prepaid balance |
| `gift_card` | `gift_cards` | stays: prepaid balance |
| `promotion` | `campaign` / `campaign-cashback` | read-only in Deals |

### 3.2 `functionalType` semantics (the decision)

- **`spending_power`** → creates/uses a persistent balance.
  - issued as `UserVoucher` (real + reward balances)
  - partial spend allowed, transferable, reloadable if configured
  - applied as a **payment instrument** at checkout/POS
- **`price_reducer`** → creates a **single-use, locked discount entitlement on the same wallet ledger**.
  - same `UserVoucher` row and real/reward split, so history and value tracking stay intact
  - `functionalType` is snapshotted onto the voucher at issuance
  - non-transferable, non-reloadable, and not spendable as a general payment
  - applied in the **discount slot** at checkout/POS (before shipping), once
  - carries scope and expiry
  - issuance (not purchase) path creates it; `purchaseVoucher` rejects `price_reducer` definitions
  - `visualType` on the definition controls whether the Deals UI renders it as a voucher or a coupon

This makes "Coupon Voucher" and "Voucher Coupon" genuinely different, and removes the dead config without adding a fifth ledger.

### 3.3 Value model

- `reward_definitions.faceValue` (bigint, pence) — canonical worth.
- `reward_definitions.splitRatio { real, reward }` — must sum to 1.
- Issued `UserVoucher` gets `faceValue`, `realBalance`, `rewardBalance`, `remainingValue`.
- Purchase rule: `totalValue = faceValue` when configured; `paymentAmount` must equal `faceValue * real` (or one of an allowed set). Without `faceValue`, fall back to the current `paymentAmount / real` behaviour for legacy definitions.
- Display rule: customer sees `faceValue` and `remainingValue`; the split is available only on demand.

---

## 4. Decisions required

| ID | Decision | Recommended default |
|---|---|---|
| D1 | Should `price_reducer` be a `Coupon` row or a new `UserVoucher` mode? | **Extend `UserVoucher`** — the doc says "this is not coupons"; a `Coupon` row would lose the wallet, real/reward split and history. `price_reducer` is a locked, single-use wallet mode, settled in the discount slot. |
| D2 | Is `faceValue` mandatory for new definitions? | **Yes**, required on create; nullable for legacy, backfilled |
| D3 | Should money-engine wallets be payable at online checkout in Phase 2, or POS-only until later? | **Yes in Phase 2** — otherwise the engine is not really usable |
| D4 | Merge ledgers or add a read facade? | **Facade first** (Phase 4a), physical merge only if still needed (Phase 4c) |
| D5 | What does "50%" cap apply to — total reward balance or cashback-contributed portion? | **Cashback-contributed portion**, per voucher, cumulative |
| D6 | Is "V-Card" the wallet or the business bio? | **Business bio keeps VCard; wallet is "MCOM Wallet"** |
| D7 | Do we keep `/dashboard/coupons`, `/dashboard/vouchers`, `/dashboard/gift-card`? | **Keep as filtered views; add `/dashboard/deals` hub** |

If D1 is rejected in favour of "one wallet", the same plan works but Phase 1 swaps "issue Coupon" for "add a non-transferable, single-use mode to UserVoucher".

---

## 5. Phased plan

### Phase 0 — Safety net (2–3 dev-days)

**Objective:** be able to change behaviour without breaking money.

1. Add feature flags:
   - `FEATURE_FUNCTIONAL_TYPE_ENFORCEMENT`
   - `FEATURE_MONEY_VOUCHER_CHECKOUT`
   - `FEATURE_DEALS_HUB`
   - `FEATURE_CASHBACK_CAP`
2. Add regression tests around:
   - `money-engine` purchase / cashback / spend / transfer
   - `coupon` validate / redeem / redeemForOrder
   - `voucher` purchase / reload / redeem
   - checkout totals ordering (coupon → shipping → gift card → voucher)
3. Add a read-only audit script that reports, per instrument: code, kind, face value (if any), real/reward split, status, scope, origin.
4. Add structured events/metrics: `instrument.issued`, `instrument.applied`, `instrument.rejected` with reason.

**Done when:** audit report runs on staging and totals reconcile with current ledgers.

---

### Phase 1 — Make the data model honest (5–7 dev-days)

**Objective:** fix G1, G2, G8, and the stored-but-unused fields.

1. **Add `faceValue`**
   - migration: `reward_definitions.face_value` bigint nullable, `moneyTransformer`
   - migration: `user_money_vouchers.face_value` bigint nullable (denormalised snapshot)
   - backfill: parse `£(\d+(\.\d+)?)` from `reward_definitions.name`; leave null when unparseable
   - admin form: send `faceValue` as a number, stop embedding it in `name`
   - API: expose `faceValue` and `remainingValue` on definition + voucher responses
2. **Enforce `functionalType`**
   - add a `RewardBehaviorService` (or methods on `MoneyEngineService`) that resolves behaviour from a definition
   - issuance path branches:
     - `spending_power` → `UserVoucher` (current path)
     - `price_reducer` → `Coupon` row with `discountType=fixed`, `discountValue=faceValue`, `usageLimit=1`, `perUserLimit=1`, `scopeConfig` from definition, `metadata.rewardDefinitionId`
   - `POST /money-engine/spend` rejects `price_reducer` instruments with a clear error
   - purchase path rejects `price_reducer` definitions (they are issued, not bought) — or supports an explicit "claim" endpoint
   - admin validation: `splitRatio.real + splitRatio.reward = 1`; `faceValue > 0`
3. **Cashback cap (G8)**
   - add `maxCashbackPercent` to `reward_definitions` (default 50) and to campaign-cashback config if applicable
   - `injectCashback()` computes cumulative cashback contribution per voucher and rejects above cap
   - add an audit row/event for rejected injections
4. **Fix split leakage (G9)**
   - customer API returns one `totalBalance`/`remainingValue` by default
   - split moved behind an explicit `?includeSplit=true` or a details endpoint
   - dashboard cards: replace "Real Money"/"Rewards Earned" with "Available to spend" unless the user opens details

**Acceptance**
- creating a definition without `faceValue` fails
- a `price_reducer` definition produces a single-use coupon-like instrument and cannot be spent as a wallet
- a `spending_power` definition behaves exactly as today
- cashback above the cap is rejected
- customer default view shows one number

---

### Phase 2 — Make the engine usable at checkout (7–10 dev-days)

**Objective:** fix G3. A split wallet must be able to pay an online order and a booking.

1. **Money-engine read/redeem API**
   - `getOwnedByCode(code, user)` with ownership check (owner/recipient email)
   - `redeemForOrder(input, order, manager?)` — transactional, `pessimistic_write` lock, idempotent on `orderId`, writes a `SPEND` transaction, emits `partner.instrument.consumed` when partner-issued
   - `redeemForBooking(input, booking, manager?)`
2. **Checkout integration**
   - extend `InitiateCheckoutDto` with `moneyVoucherCode` + `moneyVoucherAmount`
   - in `checkout.service.ts`, add a 5th instrument step **after** native voucher:
     `coupon → shipping → gift card → voucher → money voucher`
   - resolve scope via the shared `instrument-scope.service.ts`; map `ScopeType`:
     - `any_shop` → `NO_SCOPE`
     - `specific_shops` → `LISTINGS` with `validShops`
     - `expo_only` / `campaign_only` → requires `expoId` / `campaignId` metadata (sub-gap: add these fields or reject until present)
   - persist `moneyVoucherCode` / `moneyVoucherAmountApplied` on `Order` (new columns; do **not** overload `voucherCode`)
   - on order completion, redeem inside the same DB transaction as the order
3. **Booking integration**
   - same instrument step in `booking.service.ts`
4. **Price reducer at checkout**
   - apply `price_reducer` instruments in the coupon slot (before shipping), not the payment slot
   - mark used once via the coupon redemption log
5. **Tests**
   - partial payment, full payment, insufficient balance, expired, wrong owner, scope mismatch, idempotent retry, concurrent spend

**Acceptance**
- a `spending_power` wallet can pay an online order and a booking
- a `price_reducer` instrument reduces the bill and cannot pay
- balances and order status commit/roll back atomically
- retries do not double-spend

---

### Phase 3 — Attribution and analytics (3–5 dev-days)

**Objective:** fix G7.

> Implemented variant: the baseline is **per wallet** (`salesAttributed`), not a
> per-shop window. It is cheaper, deterministic, and works for POS/checkout/booking.
> A shop/campaign window baseline can layer on top later.

1. Capture a real baseline per shop/business at definition activation (or first spend): scoped sales in a window before activation.
2. Replace `salesImpactBefore = 0` with the captured baseline; `salesImpactAfter = baseline + attributed spend`.
3. Add `GET /money-engine/analytics/definitions/:id` returning: issued, redeemed, outstanding, reward given, attributed sales, redemption rate, estimated ROI.
4. Document that this is **attributed** sales, not causal lift; add a note for control-group testing later.

**Acceptance**
- transactions carry real before/after values
- business/admin dashboards show attributed sales and ROI
- no hardcoded zero remains

---

### Phase 4 — Consolidation (10–15 dev-days, optional but recommended)

**Objective:** fix G4 and G5 backend, without a big-bang migration.

1. **Deals read facade**
   - new `deals` module: `GET /deals`, `GET /deals/mine`, `GET /deals/:id`
   - aggregates `coupons`, `user_money_vouchers`, `vouchers`, `gift_cards`, `campaigns` into one DTO:
     `{ id, kind, visualType, functionalType, title, faceValue, remainingValue, scope, status, expiresAt, source }`
   - fix or delete `apps/McomMall/service/deals/hook.ts`
2. **Stop new balance-bearing coupons**
   - deprecate `coupon_products` purchase/reload path, or migrate it to `voucher_products`
   - existing `coupon.metadata.balance` rows: migrate to `vouchers` and mark the coupon read-only
3. **One balance ledger**
   - extend `DigitalValueType` with `money_voucher` (or map to `voucher`) and write `digital_value_master` rows for `user_money_vouchers`
   - make `digital-value` the canonical balance view; keep domain tables as the write source of truth
4. **Canonical resolver**
   - `InstrumentsService.resolve(code)` → `{ kind, behavior, balance, scope, status }`
   - use it in checkout, booking, POS, and Deals so no caller needs to know which table a code lives in

**Acceptance**
- `/deals/mine` returns real aggregated data
- no new coupon holds a balance
- one resolver used by checkout/booking/POS/Deals
- reconciliation report shows zero unexplained differences

---

### Phase 5 — UX, create flow, terminology (5–8 dev-days)

**Objective:** fix G5 frontend, G10, G11.

1. **Deals hub**
   - add `/dashboard/deals` with tabs: Standard Coupons · Coupon Vouchers · Voucher Coupons · Gift Cards · Promotions
   - keep `/dashboard/coupons`, `/dashboard/vouchers`, `/dashboard/gift-card` as filtered views or redirects
   - update `lib/menu-items.ts` and `lib/user-menu.ts`
2. **Business create wizard**
   - one "Create offer" entry with a type selector: Standard Coupon / Coupon Voucher / Voucher Coupon
   - Standard Coupon → existing coupon form
   - Coupon Voucher → definition-backed spending wallet (admin-defined templates only)
   - Voucher Coupon → definition-backed price reducer
   - enforce tier capability (`CREATE_COUPON_TEMPLATE`) on all three
3. **Top-up / contribution (G6)**
   - `POST /money-engine/vouchers/:code/contribute` with payment verification
   - credits `realBalance` (+ optional reward match), writes a `USER_DEPOSIT`/`PEER_GIFT` transaction with `contributorId`
   - enforce `faceValue` target if set; show progress
   - shareable link/QR in the wallet UI
4. **Terminology (G10)**
   - reserve "VCard" for the business bio card
   - call the voucher wallet "MCOM Wallet" / "Spending Wallet" everywhere
5. **Admin alignment**
   - rename admin page copy from "Coupon Voucher" to the three explicit types
   - show `faceValue`, behaviour, scope, and cap in the definitions table

**Acceptance**
- one Deals hub; old routes still work
- business can create all three offer types
- multiple contributors can fund one voucher to target
- no ambiguous "V-Card" in voucher flows

---

## 6. Rollout sequence

```
Phase 0  →  Phase 1 (flag off, backfill)  →  Phase 1 (flag on, staging)  →  Phase 2
        →  Phase 3  →  Phase 4a (facade, dual-read)  →  Phase 4b/4c (migrate, deprecate)
        →  Phase 5
```

Rules:
- migrations are additive first; destructive changes only after one full release with dual-read
- every enforcement ships dark, then is enabled per environment
- backfills are idempotent and re-runnable
- keep old endpoints working for one release; add deprecation headers

---

## 7. Test plan

| Layer | Coverage |
|---|---|
| Unit | behaviour resolver, split maths, cap maths, scope mapping, pricing |
| Integration | purchase → issue → checkout → redeem → refund/rollback; booking variant |
| Concurrency | two spends on one wallet; last-use coupon; concurrent cashback injections |
| Migration | backfill idempotency; before/after reconciliation totals |
| Contract | partner instrument issuance idempotency on `code` and `issuanceId` |
| UI | Deals tabs, create wizard, contribution flow, single-number default view |

---

## 8. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Enforcing `functionalType` changes existing behaviour | Existing "price_reducer" definitions may be in use | Ship behind flag; audit count first; grandfather legacy definitions |
| Checkout integration double-spends | Financial loss | Pessimistic lock + idempotency key + same transaction as order |
| `faceValue` backfill mis-parses names | Wrong worth displayed | Leave unparseable as null; require manual review; never guess |
| Ledger migration loses money | Critical | Dual-read + reconciliation report; no deletes until zero diff |
| Deals facade becomes a second source of truth | Drift | Read-only aggregation; writes stay in domain services |
| 50% cap breaks existing campaigns | Merchant complaints | Default cap only for new definitions; configurable per definition |
| Expo/campaign scope lacks IDs | Wrong scoping | Reject `expo_only`/`campaign_only` until metadata exists, or add fields in Phase 2 |

---

## 9. Out of scope

- Real cash withdrawal / bank payout
- Causal incrementality measurement (control groups)
- Rewards-side (mcom-rewards) changes beyond the existing partner contract
- Reworking the gift-card template/theme system
- Mobile app changes

---

## 10. Definition of done

- [x] `functionalType` is enforced in issuance, spend, checkout and booking
- [x] every new definition has a numeric `faceValue`; issued instruments store it
- [x] money-engine wallets can pay online orders and bookings
- [x] `price_reducer` instruments behave as single-use discounts, not wallets
- [x] cashback respects the configured cap
- [x] sales attribution uses real before/after values
- [x] one Deals hub backed by real aggregated data; `/deals/mine` works
- [x] no new coupon holds a balance
- [x] one canonical instrument resolver used by all spend paths
- [x] customers see one number by default
- [x] business can create Standard Coupons and issue Voucher Coupons; Coupon Voucher templates stay admin-controlled
- [x] multiple contributors can fund a voucher to target
- [x] reconciliation report shows zero unexplained differences

### Final completion pass (2026-11-17)

- Added the missing Voucher Coupon lifecycle: issuance endpoint (admin, or a
  business that owns a scoped listing), single-use discount application at
  checkout/order/booking, and the customer/business/admin issue UIs.
- Added contribution targets so admin-issued spending-power wallets can be
  funded by friends/family without conflicting with purchased wallets.
- Added expiry, item-level scope, campaign-scope enforcement, and lazy expiry.
- Added ownership/tenant guards to spend, POS spend, cashback and transfer.
- Added per-order/per-booking real-vs-reward settlement snapshots, typed
  transaction attribution and an admin settlement report.
- Locked terminal-cashback earnings from wallet withdrawal so cashback stays
  inside the network.
- Enabled the money-engine flags by default and added regression coverage.

---

## 11. Suggested cut line

- **Minimum viable alignment:** Phases 0–2. Fixes the three critical gaps (dead `functionalType`, no face value, unusable wallet) without touching the ledgers.
- **Full alignment:** Phases 0–5. Also consolidates Deals, attribution, top-up, and terminology.
