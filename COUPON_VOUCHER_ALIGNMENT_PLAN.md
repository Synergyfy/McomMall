# Coupon-Voucher / Voucher-Coupon Alignment Plan

> Goal: make the shipped system actually behave like the "programmable spending power" model:
> name/visual is presentation, `functionalType` is behaviour, real vs reward is always tracked,
> and every instrument is spendable inside the network.

Status: **draft plan** · Owner: TBD · Last updated: 2026-11-17

---

## 1. What is misaligned today

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
- **`price_reducer`** → creates a **single-use discount entitlement**.
  - no persistent balance; no transfer; no reload
  - applied in the **discount slot** at checkout/POS (before shipping), once
  - still carries scope and expiry
  - implemented by issuing a `Coupon` row linked to the reward definition (`metadata.rewardDefinitionId`, `issuanceId`), so the existing coupon math, usage limits and redemption log are reused
  - `visualType` on the definition controls whether the Deals UI renders it as a voucher or a coupon

This makes "Coupon Voucher" and "Voucher Coupon" genuinely different, and removes the dead config.

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
| D1 | Should `price_reducer` be a `Coupon` row or a new `UserVoucher` mode? | **Coupon row** — reuses limits, scope, redemption log, checkout math |
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

- [ ] `functionalType` is enforced in issuance, spend, checkout and booking
- [ ] every new definition has a numeric `faceValue`; issued instruments store it
- [ ] money-engine wallets can pay online orders and bookings
- [ ] `price_reducer` instruments behave as single-use discounts, not wallets
- [ ] cashback respects the configured cap
- [ ] sales attribution uses real before/after values
- [ ] one Deals hub backed by real aggregated data; `/deals/mine` works
- [ ] no new coupon holds a balance
- [ ] one canonical instrument resolver used by all spend paths
- [ ] customers see one number by default
- [ ] business can create Standard Coupon / Coupon Voucher / Voucher Coupon
- [ ] multiple contributors can fund a voucher to target
- [ ] reconciliation report shows zero unexplained differences

---

## 11. Suggested cut line

- **Minimum viable alignment:** Phases 0–2. Fixes the three critical gaps (dead `functionalType`, no face value, unusable wallet) without touching the ledgers.
- **Full alignment:** Phases 0–5. Also consolidates Deals, attribution, top-up, and terminology.
