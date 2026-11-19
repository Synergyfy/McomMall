# Gift Card / Coupon / Voucher Purchase — Verification & Code Plan

**Date:** 2026-11-18
**Scope:** Business creates a gift card, coupon product and voucher product; customer opens
`/listings/e1daca4e-9ec7-40ad-9621-4c638dda66cc?source=in-house` and buys them; MCOM Pay must
serve all three payment forms.
**Status:** Investigation complete and the agreed fixes implemented locally. The API was rebuilt,
restarted, and the three purchase flows were re-tested end-to-end against MCOM Pay.
Local test data was created and approved through the real APIs and UI.

---

## 1. Environment that was actually tested

| Component | Address | Notes |
|---|---|---|
| Storefront | `http://localhost:3003` | Next.js dev server (`apps/McomMall`) |
| Mall API | `http://localhost:3006/api/v1` | `apps/mcom_mallAPI`, running from `dist/main` |
| MCOM Central API | `http://localhost:3010/api/v1` | `central-hub-solution/apps/backend` |
| Postgres | `localhost:5432` | databases `mcom_mall` and `mcom_solutions` |

Confirmed before testing:

- `MCOM_PAY_ENABLED=true`, `MCOM_WALLET_ENABLED=true`.
- Central's Stripe test account and `NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY` are the
  same account (`pk_test_51LXA6l...`). Card confirmation therefore works with the client secret
  returned by MCOM Pay.
- The Central `mcom-mall` client has `webhook_url =
  http://localhost:3006/api/v1/payments/mcom/webhook`, and the mall's `MCOM_WEBHOOK_SECRET`
  matches the registered secret.
- The mall HMAC secret is accepted by Central (charges are created successfully).

---

## 2. What was actually created and purchased

Business owner: `testman00@gmail.com` (listing owner of `e1daca4e-...`).

Created through the same endpoints the business dashboard uses:

| Item | ID | Initial state |
|---|---|---|
| Gift card template `QA Test Gift Card` | `bf9bcff5-5b53-43a6-b7d1-3e22f1ea58db` | `approvalStatus: pending` |
| Coupon product `QA Test Coupon` | `14155217-14ff-474f-9897-ab2dbcbb1761` | `approvalStatus: pending` |
| Voucher product `QA Test Voucher` | `8fd68bd0-6e5c-4902-8a72-bdf69676f1a9` | `approvalStatus: pending` |

All three were invisible to the customer until approved:

```text
GET /gift-cards/templates/business/e1daca4e-...  -> []
GET /coupons/products/business/e1daca4e-...      -> []
GET /vouchers/products/business/e1daca4e-...     -> only the old approved voucher
```

They were then approved via `PATCH /api/v1/admin/moderation/{resource}/{id}/approve` (admin
`qa-admin@mcommall.local`) and appeared on the listing.

Purchase results after approval:

| Flow | Result |
|---|---|
| Gift card — Stripe card | **Working.** `POST /gift-cards/purchase` returned a client secret; 4242 test card confirmed in the browser; `POST /gift-cards/purchase/verify` issued the card. `payment_allocations` has a `GIFT_CARD` row. |
| Gift card — MCOM Wallet | **Working.** Wallet hold created, verified, gift card issued. |
| Gift card — PayPal | **Order creation working.** Returned order id + sandbox `approvalUrl`. |
| Voucher — Stripe | **Working.** Initiate returned a client secret; the intent was confirmed and `/vouchers/verify-purchase` issued the voucher. |
| Voucher — PayPal | **Order creation working.** Returned order id + sandbox `approvalUrl`. |
| Coupon — Stripe | **Blocked before MCOM Pay**: `400 Coupon products are retired. Use vouchers for balance-based instruments.` |

MCOM Pay itself is not the failure point for gift cards or vouchers. It creates and verifies
charges correctly. The failures are in catalog/approval workflow, retired coupon UI, voucher
product semantics, and a few frontend defects.

---

## 3. Findings (ordered by severity)

### F1 — Critical: business-created catalog items are permanently pending

- `GiftCardService.createTemplate()` forces `approvalStatus: PENDING`
  (`apps/mcom_mallAPI/src/resources/gift-card/gift-card.service.ts`).
- `CouponProductService.create()` forces `PENDING`.
- `VoucherService.createVoucherProduct()` forces `PENDING`.
- Every public query filters on `APPROVED`:
  - gift cards: `getPublicTemplates()` ~line 1197
  - coupon products: `findCouponProductsByBusiness()` ~line 134
  - voucher products: public listing ~line 2147
- The admin API for approval exists (`/admin/moderation/:resource/:id/approve`).
- **But the admin app has no moderation page for these resources.** There are only create/edit
  pages for gift-card templates and voucher products; no list/approval UI. `/admin/vouchers` is
  linked from the sidebar but has no page.
- Result: a business creates an item, the customer sees an empty Offers tab, and there is no
  normal admin action to publish it.

**This is the main reason "create then buy as customer" does not work.**

### F2 — Critical: coupon products are retired, but the UI still sells them

- `CouponService.assertLegacyCouponProductsDisabled()` throws when
  `FEATURE_LEDGER_CONSOLIDATION=true`.
- The local env has `FEATURE_LEDGER_CONSOLIDATION=true`.
- The storefront always renders the **Coupons** tab (`OffersSection`).
- The business dashboard still has **New coupon product**
  (`/dashboard/coupons/products/new`).
- `POST /coupons/initiate-purchase` therefore returns `400`.
- The customer sees "Failed to initiate payment. Please try again." after choosing a method.

The repo's own roadmap (`COUPON_VOUCHER_ALIGNMENT_PLAN.md`, Phase 4b/4c) says this retirement is
intentional. The UI has not caught up.

### F3 — High: vouchers created by the dashboard wizard cannot be bought

- `/dashboard/vouchers/new` creates a `gift_voucher` with `valueType: percentage|currency` and a
  `value`, and **does not send `fixedAmounts` or `allowCustomAmount`**.
- The customer-facing `VoucherPurchaseModal` only offers fixed amounts/custom amount; it has no
  input when the product has neither.
- `VoucherService.validatePurchaseAmount()` rejects every amount for such a product.
- The voucher tab also prints `Starting From £10` as a fallback even when the product has no
  fixed amounts.
- The edit form (`VoucherProductForm`) has no fields for `valueType`/`value` either, so the two
  creation paths disagree.

Result: the most likely business-created voucher is unpurchasable, and there is no useful error
in the UI.

### F4 — High: gift-card cards on the Offers tab are invisible on first load

- `GiftCardTabContent` renders cards with
  `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}` inside the default
  Radix tab panel.
- On a fresh load the inline style stays `opacity: 0; transform: scale(0.95)` indefinitely.
  Reproduced in two fresh tabs after 3–8 seconds.
- The card text is in the DOM but the card and its "Purchase Card" button are not visible.
- Switching to another tab and back remounts the panel and the animation then runs.

Result: gift cards are effectively not discoverable from the listing page.

### F5 — Medium: customer gift-card page calls a merchant-only assets endpoint

- `NewGiftCardFlow` calls `useGetGiftCardAssets(template.id)`.
- That hook calls `GET /merchant/gift-cards/templates/:id/assets`, which is guarded/owner-only.
- A customer gets `404`, so the "Theme & Image" section is empty and the console fills with
  failed requests.
- There is no public asset endpoint for gift-card design assets.

### F6 — Medium: purchase orders stay `PENDING` after verified payment

Gift card and voucher purchases create an `Order` in their verification transaction without a
status, so the default `PENDING` is used:

```text
gift card order d6856efb-...  PENDING  payment paid
gift card order c782ca98-...  PENDING  payment paid
voucher   order 6b1acce1-...  PENDING  payment paid
```

Normal checkout orders correctly show `COMPLETED`. This pollutes order/admin reporting and
contradicts the documented "paid orders become COMPLETED" behaviour.

### F7 — Low: currency labels are wrong in places

- Gift-card payment modal says `Pay $10`.
- Voucher wizard previews and descriptions use `$`.
- Some backend messages use `$`/`£` inconsistently.
- The API currency is GBP throughout.

### F8 — Low: coupon amount entry ignores the product's amounts

- `CouponPurchaseModal` renders a free-form amount input for every product.
- It should render `fixedAmounts` buttons and only show a custom input when
  `allowCustomAmount` is true; otherwise the backend rejects the amount with a 400.

### F9 — Low: empty Offers tabs

- `OffersSection` enables the gift-card and voucher tabs from the user-level `giftCard` /
  `voucher` flags (both default `true`), not from whether approved products exist.
- The coupon tab is always enabled.
- Customers see tabs that contain nothing.

---

## 4. Proposed code plan

### Phase 0 — Test harness and guardrails (small)

1. Add a Playwright smoke test in `apps/McomMall` that:
   - logs in as a business user and creates the three catalog items;
   - logs in as admin and approves them;
   - logs in as customer, opens the listing, buys a gift card and voucher with Stripe test card
     `4242 4242 4242 4242`;
   - asserts the issued entitlements and `payment_allocations`.
2. Add a dev script to reset the QA catalog rows between runs (do not touch production data).
3. Keep the existing API unit suite as the first gate.

### Phase 1 — Make the catalog approval workflow usable

**Backend**

- Keep the existing moderation endpoints.
- Add API tests proving: create -> `pending` -> public query returns nothing -> approve ->
  public query returns the item.
- Optionally add `approvalStatus` / `adminDisabled` / `reviewNote` to the public DTOs only where
  safe (they already come back from the merchant endpoints).

**Admin app (`apps/McomMallAdmin`)**

- Add `service/moderation/{api,hook,types}.ts`:
  - `GET /admin/moderation/stats`
  - `GET /admin/moderation/:resource?status=pending`
  - `PATCH /admin/moderation/:resource/:id/approve|reject|delist|republish`
- Add `app/admin/moderation/page.tsx` with tabs for:
  - `gift-card-templates`
  - `voucher-products`
  - `coupon-products`
  (extend to `offers`, `time-bonuses`, `products`, `services` later).
- Each row: name, business owner, value/amounts, created date, status, actions, review-note
  dialog.
- Add sidebar entry "Catalog approvals" with pending count.
- Add the missing `/admin/gift-cards` and `/admin/vouchers` index pages, or fix the sidebar
  links to the existing create/edit pages.

**Business dashboard (`apps/McomMall`)**

- Extend the three catalog item types with `approvalStatus`, `adminDisabled`, `reviewNote`.
- Show a clear badge on each card: **Live**, **Pending approval**, **Rejected**, **Delisted**.
- Change the post-create toast to "Submitted for admin approval" (not "created/live").
- Link rejected items to the review note.
- Keep the storefront preview disabled until approved.

### Phase 2 — Resolve the coupon contradiction (decision required)

**Option A (recommended, follows the repo roadmap): retire coupon products in the UI**

- Expose the flag through a public endpoint, e.g. `GET /settings/features`:
  ```json
  { "ledgerConsolidation": true, "couponProductsEnabled": false,
    "moneyVoucherCheckout": true, "dealsHub": true }
  ```
  (The existing `GET /payments/config` is auth-guarded and cannot be used by the public listing.)
- In `OffersSection`: hide the **Coupons** tab when `couponProductsEnabled=false`.
- In `CouponTabContent` / `CouponPurchaseModal`: do not render the purchase flow when disabled;
  show a short "Coupons are now vouchers" link to the Deals/Reward hub.
- In the business dashboard: hide **New coupon product** and show a migration notice when
  disabled.
- Keep existing coupon rows readable in history/my-coupons.
- Add tests for flag-on/flag-off rendering and for the backend 400.

**Option B: keep selling coupon products**

- Turn `FEATURE_LEDGER_CONSOLIDATION` off (or narrow the guard so it only blocks the legacy
  balance-bearing path while a new discount-coupon path is added).
- Fix `CouponPurchaseModal` to render fixed amounts/custom input (F8).
- Re-run the same MCOM Pay tests for coupon initiate -> verify -> entitlement.
- Add a migration/communication plan because the repo docs currently describe these as retired.

### Phase 3 — Align voucher creation with voucher purchasing

**Wizard (`/dashboard/vouchers/new`)**

- Replace the `valueType` / `value` inputs with the same amount model used by gift cards:
  - `fixedAmounts` chips (e.g. 10, 25, 50),
  - `allowCustomAmount` + min/max.
- Send `voucherType: "gift_voucher"`, `valueType: "fixed"`, `value: 0`, plus `fixedAmounts` /
  `allowCustomAmount`.
- Require at least one fixed amount or a valid custom range before launch.
- Update the live preview to show the amount list instead of `% OFF` / `$`.

**Edit form (`VoucherProductForm`)**

- Add the same fixed-amount/custom controls; keep them in sync with the wizard.

**Storefront (`VoucherTabContent` / `VoucherPurchaseModal`)**

- Only show products that are actually purchasable (fixed amount or custom amount).
- If a legacy percentage voucher has no amounts, show a disabled card with "Not available for
  online purchase" instead of a Buy Now button.
- Remove the hard-coded `£10` fallback in "Starting From".
- Keep the existing amount selection; show a clear message when no amount is selected.
- Surface MCOM Pay errors (see Phase 5).

**Backend**

- In `createVoucherProduct` / `updateVoucherProduct`, validate that a product is either
  fixed-amount based or custom-amount based.
- Decide whether percentage/currency vouchers are discounts (price reducers) rather than
  stored-value vouchers. If they are, they should use the standard coupon/discount path, not the
  voucher purchase flow.

### Phase 4 — Fix gift-card storefront defects

1. `GiftCardTabContent`: remove the mount animation (or use `initial={false}` / CSS) so cards are
   visible on first paint. Verify with a fresh tab and `prefers-reduced-motion`.
2. `NewGiftCardFlow`: stop calling the merchant assets endpoint as a customer.
   - Either add `GET /gift-cards/templates/:id/assets` (public) returning safe design assets, or
     remove the asset picker and use the template's branding fields.
3. `PaymentModal`:
   - Use `CURRENCY` (`£`) for the Pay button and totals.
   - Prefer `PaymentElement` with the client secret (same as vouchers) so UK country/postal
     fields are explicit; if keeping `CardElement`, show the postal field and validation state.
   - Map MCOM Pay errors to actionable messages.
4. Remove or align the dead legacy `PurchaseForm` / `PurchaseForm`-only imports so there is one
   gift-card purchase flow.

### Phase 5 — MCOM Pay error/UX hardening

- Add a shared payment-error mapper used by gift card, voucher and coupon modals:
  - `WALLET_INSUFFICIENT_FUNDS` -> show "Top up MCOM Wallet" using `topUpUrl`.
  - `CHARGE_ALREADY_USED` / `PAYMENT_ALREADY_RECORDED` -> "This payment is already linked to
    another purchase."
  - `SERVICE_UNAVAILABLE` -> "Payments are temporarily unavailable."
  - `INVALID_SIGNATURE` / `UNAUTHORIZED` -> support message (do not leak internals).
- Show the server's message for 400s instead of a generic toast.
- Ensure all three flows use `approvalUrl` for PayPal rather than trying to drive PayPal with
  the mall's SDK.
- Add a health/smoke check that verifies:
  - `GET /api/v1/payments/config` returns `mcomPayEnabled: true`;
  - Central's charge create/confirm/refund endpoints are reachable;
  - the webhook URL/secret are configured (without printing secrets).

### Phase 6 — Fix purchase order status

- In gift-card `verifyAndCompletePurchase`, voucher `verifyAndCompletePurchase`, and coupon
  `verifyAndCompleteCouponPurchase`, create the `Order` with
  `status: OrderStatus.COMPLETED` (payment has already been verified), or update it to
  `COMPLETED` immediately after saving.
- Add a shared helper to avoid repeating the order/payment/allocation block.
- Add a regression test asserting `order.status === COMPLETED` for all three flows.

### Phase 7 — Hide empty storefront tabs (after Phase 2/3)

- `OffersSection` should enable the gift-card/voucher tabs only when approved, purchasable items
  exist (or keep the tab but show a clearer empty state).
- Hide the coupon tab when coupon products are retired.

---

## 5. Verification plan after implementation

1. **API unit tests** (mocked MCOM Pay):
   - create -> pending -> public empty -> approve -> public visible;
   - gift card / voucher / coupon initiate returns the expected client secret/order/hold;
   - verify issues exactly one entitlement and writes one `payment_allocations` row;
   - replaying the same charge is idempotent;
   - a different customer or wrong amount is rejected;
   - order status is `COMPLETED`.
2. **Integration smoke** (local Central, Stripe test keys):
   - gift card card + wallet;
   - voucher card;
   - coupon card (only if Option B is chosen);
   - PayPal order creation; complete in sandbox if credentials allow.
3. **Playwright UI smoke**:
   - fresh listing load: gift-card card is visible and clickable;
   - business creates items, sees "Pending approval";
   - admin approves;
   - customer buys and sees the success state;
   - coupon tab is hidden or works according to the chosen option.
4. **Regression checks**:
   - checkout, membership and booking card/wallet flows still work;
   - `mcom_pay_charges` and `payment_allocations` are consistent;
   - no secrets printed in logs or UI.

---

## 6. Decision taken and implementation log

**Decision: Option B — re-enable coupon-product sales.** Coupons remain a purchasable
balance-bearing instrument in this deployment. `FEATURE_LEDGER_CONSOLIDATION` is set to `false`
in `apps/mcom_mallAPI/.env`, and the code default is now `false` as well; the existing guard
remains in code so the retirement can be re-enabled deliberately later.

Implemented locally:

### API
- `apps/mcom_mallAPI/.env`: `FEATURE_LEDGER_CONSOLIDATION=false`.
- Gift card, voucher and coupon purchase/reload orders are now created with
  `status: OrderStatus.COMPLETED` after verified payment (previously they stayed `PENDING`).
- Added `GET /gift-cards/templates/:id/assets` (public, approved templates only) so shoppers no
  longer call the merchant-only assets endpoint.
- PayPal approval URLs now carry the mall's `returnUrl` / `cancelUrl` through MCOM Pay (Central
  accepts and applies them to the PayPal order), so the payer returns to the mall instead of
  Central's generic success page.
- `VoucherService.createVoucherProduct` now:
  - rejects products with no fixed amounts and no custom amount;
  - rejects invalid custom ranges;
  - stores `valueType: 'fixed'` / `value: 0` for merchant vouchers unless explicitly supplied.
- Added tests:
  - `src/resources/voucher/voucher.service.spec.ts` (amount validation + pending approval);
  - `src/resources/gift-card/gift-card.service.spec.ts` (public assets visibility).
- Added a read-only MCOM Pay health check:
  `pnpm --filter @mcommall/api check:mcom-pay` (env completeness + Central reachability,
  no charge created).
- Central (`central-hub-solution/apps/backend`) `POST /app-payments/charges` now accepts
  optional `returnUrl` / `cancelUrl` and uses them for the PayPal `application_context`.

### Storefront (`apps/McomMall`)
- Gift card Offers cards no longer start at `opacity: 0`; they are visible on first paint.
- Voucher/coupon tab cards no longer wait on a mount animation.
- Offers tabs are now data-driven: Gift Cards / Vouchers / Coupons only show when approved,
  purchasable items exist or the query is still loading.
- Gift card purchase modal:
  - replaced the legacy `CardElement` flow with `PaymentElement` + client secret;
  - shows `£` instead of `$`;
  - maps MCOM Pay errors to actionable messages (including wallet top-up).
- Voucher purchase modal:
  - shows a clear "no online amount" state for legacy percentage vouchers;
  - disables Buy Now / Proceed when there is nothing to select;
  - shows MCOM Pay error details.
- Coupon purchase modal:
  - renders fixed amount buttons and validates custom amounts;
  - shows the backend error instead of a generic toast;
  - uses the shared MCOM Pay error mapper.
- Business dashboard cards now show **Pending approval / Rejected / Delisted** badges.
- Gift card / coupon / voucher create toasts now say the item was submitted for approval.
- Voucher creation wizard now collects fixed amounts + optional custom range, sends
  `valueType: 'fixed'`, and previews `£` amounts.
- Public gift card assets hook now calls `/gift-cards/templates/:id/assets`.
- Added `/payment/paypal/return`, which reads the pending purchase from `sessionStorage`,
  verifies the PayPal order with the mall API, and shows the issued code. Cancellations are
  handled without leaving a pending purchase behind.
- Gift card, voucher and coupon PayPal initiations now send the return/cancel URLs and remember
  the purchase context across the PayPal redirect.

### Admin (`apps/McomMallAdmin`)
- Added `app/admin/moderation/page.tsx` and `service/moderation/*`:
  - queue tabs for gift cards, vouchers and coupons;
  - pending/approved/rejected filters, search, pagination;
  - approve / reject (with review note) / delist / republish actions;
  - live pending counts.
- Added **Catalog Approvals** to both navigation definitions.
- Fixed the **Vouchers** sidebar link to point at the voucher moderation queue.
- Fixed moderation ordering for entities that expose `createdAt` instead of the base
  `created_at` column (voucher products and coupon products previously returned 500).

### Verification after implementation
- API: `pnpm --filter @mcommall/api typecheck` ✅
- Storefront/admin TypeScript: `tsc --noEmit` ✅
- API tests: 219/219 passing (including the new voucher, gift-card and feature-flag tests).
- Live UI:
  - Gift card card is visible on a fresh Offers load.
  - Coupon purchase completed with Stripe test card and issued a coupon code.
  - Gift card purchase completed with Stripe test card and issued a gift card.
  - Voucher purchase completed with Stripe test card and issued a voucher code.
  - Admin moderation page listed a new pending gift card and approved it from the UI;
    the gift-card, voucher and coupon moderation lists all return 200 after the ordering fix.
  - New coupon, gift card and voucher orders are `COMPLETED`.
  - Wallet gift card purchases still issue entitlements through the new payment modal.
  - PayPal initiation sends the mall return/cancel URLs (request body inspected), the PayPal
    order is created, the pending purchase context is stored, and the return page's cancel and
    error paths were exercised.
  - Full PayPal buyer completion was not executed because this environment has no sandbox
    buyer credentials; the return page is wired to the same verify endpoints that were tested
    with Stripe/wallet.

### Note on the retirement flag
The code still supports `FEATURE_LEDGER_CONSOLIDATION=true` (covered by the feature-flag and
coupon-service tests). To retire coupon products again, set the flag to `true` and hide the
Coupon tab/create actions; no further backend change is required. The default is now
`false` so a fresh environment keeps coupons purchasable unless explicitly retired.

---

## 7. Local state left behind by this verification

- Approved and visible on the test listing:
  - `QA Test Gift Card` (`bf9bcff5-...`);
  - `Pending Approval Gift Card` (created to test the admin queue, then approved in the UI);
  - `QA Test Coupon` (`14155217-...`);
  - `QA Test Voucher` and `QA Amount Voucher` (`8fd68bd0-...`, `b4824205-...`).
- Purchases completed in Stripe test mode:
  - gift card via card, gift card via MCOM Wallet, gift card via the new `PaymentElement`;
  - voucher via card (server-confirmed and UI-confirmed), voucher via wallet;
  - coupon via card.
- Corresponding `mcom_pay_charges`, `order_payments`, `payment_allocations` and
  `gift_cards` / `vouchers` / `coupons` rows exist.
- The new purchase orders are `COMPLETED`. Older QA orders created before the fix remain
  `PENDING` as historical data.
- The legacy percentage voucher `Veniam dolorem ut e` remains unpurchasable and is the
  regression case for the new "Unavailable" storefront state.

Delete or reset these rows before a clean demo if needed. The local API process was restarted
from `dist/main` after the rebuild; keep it running for the demo.
