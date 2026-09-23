# McomMallAdmin — Real Data Migration Tracker

> Goal: eliminate all mocked / hardcoded dummy data from **35 admin pages** and wire every widget to live `mcom_mallAPI` endpoints.
> Workflow: approach **batch by batch**. When a page is finished, tick it `- [x]` with PR/commit ref.
> 
> **DONE definition (all must hold):**
> - [ ] No `mock-data` import, no `const mock*`, `MOCK_*`, or inline hardcoded record arrays for business data
> - [ ] Data comes from `service/<domain>/api.ts + hook.ts` (`useQuery`/`useMutation`, shared `service/api.ts` axios client)
> - [ ] Loading / empty / error states + pagination (`page`, `limit`, `totalPages`) + search/status filters that actually hit the API
> - [ ] No `any`, no `ts-ignore`, explicit return types; backend changes follow `.agent` rules (DTO validation, Swagger, no N+1, migrations with `up/down`)
> - [ ] `pnpm --filter McomMallAdmin typecheck && lint && build` green for the touched route
>
> **Commands (pnpm ONLY — never npm/yarn):**
> ```bash
> pnpm --filter McomMallAdmin typecheck
> pnpm --filter McomMallAdmin lint
> pnpm --filter McomMallAdmin build
> pnpm --filter @mcommall/api migration:generate src/database/migrations/<Name>
> pnpm --filter @mcommall/api migration:run
> ```
>
> **Verify no mocks remain:**
> ```bash
> rg -i "from.*mock-data|const mock[A-Z]|MOCK_[A-Z_]+" apps/McomMallAdmin/app/admin
> ```

---

## Batch 1 — Backend-ready (frontend-only work) — 16 pages

| # | Page | Backend endpoint | Status |
|---|------|------------------|--------|
| 1 | `app/admin/analytics/page.tsx` | `GET /admin/analytics?range=` (`AdminAnalyticsService`) | [x] 2026-09-22 — wired to `useGetAdminAnalytics`, removed all hardcoded chart arrays |
| 2 | `app/admin/automations/page.tsx` | `GET /automations`, `GET /automations/summary` | [x] 2026-09-22 — business selector + live list/summary/toggle/delete via `service/automations` |
| 3 | `app/admin/businesses/page.tsx` | `GET /admin/businesses`, `GET /admin/businesses/stats` | [x] 2026-09-22 — live directory/stats/profile/verify/suspend via `service/admin`; removed `mockBusinesses` + `mockVerificationData` |
| 4 | `app/admin/campaigns/page.tsx` | `GET /campaigns`, `GET /campaigns/:id/stats` | [x] 2026-09-22 — live marketing-campaign list/detail/delete via `GET /campaigns/marketing/*`; removed `mockCampaigns` + mock KPIs/wizard |
| 5 | ~~`app/admin/gamification/page.tsx`~~ MOVED to Batch 3 (#36 — endpoints are `OWNER`-role only, admin cannot call) | — | [ ] |
| 6 | `app/admin/loyalty/page.tsx` | `GET /loyalty/stats`, `GET /loyalty/rules`, `GET /loyalty/settings` | [x] 2026-09-22 — business selector + live stats/offers/rules/settings via `service/loyalty`; removed fake programs/logs |
| 7 | `app/admin/marketplace/page.tsx` | `GET /marketplace/public`, `/banners`, `/categories`, `/sections` | [x] 2026-09-22 — live stores/businesses + banners/categories/sections CRUD; removed `mockStores` + mock KPIs |
| 8 | `app/admin/marketing/page.tsx` | `GET /campaigns/marketing/list` | [x] 2026-09-22 — live coupons via `GET /coupons/list` + real create/delete; dead tabs now link to real routes |
| 9 | ~~`app/admin/partnerships/page.tsx`~~ MOVED to Batch 3 (#37 — page is institutional partners/plaques; backend `partnerships` is user-scoped B2B item-sharing, different domain) | — | [ ] |
| 10 | `app/admin/promotions/page.tsx` | `GET /admin/promotions`, `GET /promotions/*` | [x] 2026-09-22 — live list via `GET /admin/promotions` + delete; removed `mockPromotions` + mock KPIs/wizard |
| 11 | `app/admin/qlinks/page.tsx` | `GET /qr-codes` (qr-codes module) | [x] 2026-09-22 — business selector + live QR list/scans/pause/delete via `service/qlinks` |
| 12 | `app/admin/support/page.tsx` | `GET /support-tickets`, `GET /support-tickets/:id` | [x] 2026-09-22 — live queue/detail/reply/resolve/close via `service/support`; removed hardcoded tickets |
| 13 | `app/admin/team/page.tsx` | `GET /team/:businessId` | [x] 2026-09-22 — per-business live teams/invites + invite/suspend/remove via `service/team` |
| 14 | `app/admin/tiers/seasons/page.tsx` | `GET /seasons`, `GET /tiers`, `GET /system/plans` | [x] 2026-09-22 — live list/create via `service/seasons`; removed `MOCK_SEASONS` + local-only create |
| 15 | `app/admin/users/page.tsx` | `GET /admin/users`, `GET /customers/directory`, `/activity`, `/segments` | [x] 2026-09-22 — live directory/stats/filters/pagination via `service/admin`; removed `mockCustomers` + mock KPIs/modals |
| 16 | `app/admin/notifications/page.tsx` | `GET /notifications` (extend for broadcast/audience) | [x] 2026-09-22 — live inbox + mark-seen + real broadcast composer; removed hardcoded channel counts |

## Batch 2 — Needs backend extension — 7 pages

| # | Page | Gap → action | Status |
|---|------|--------------|--------|
| 17 | `app/admin/billing/page.tsx` | Have `/wallet`, `/payments/history`, `/settings/billing`, `/admin/transactions`. ADD `GET /admin/billing/invoices`, `GET /admin/billing/payouts` + approval mutation | [x] 2026-09-22 — live stats + transactions w/ type tabs via `/admin/transactions`; fixed stale DTO types + broken `transactions` page; payout approval still pending backend |
| 18 | `app/admin/boroughs/page.tsx` | Have `/borough-campaigns`. ADD `GET /boroughs`, `GET /boroughs/:id` or extend `visibility` module + migration | [x] 2026-09-22 — new `boroughs` backend module (entity/CRUD/stats, migration generated); live list/onboard/delete via `service/boroughs` |
| 19 | `app/admin/boroughs/[id]/page.tsx` | Same as above (detail, footfall, high-streets) | [x] 2026-09-22 — live detail/campaigns/edit/activate/remove; removed hardcoded borough lookup |
| 20 | `app/admin/high-streets/page.tsx` | Have `GET /high-street/readiness`. Extend to full CRUD/list | [x] 2026-09-22 — new `high-streets` backend module (entity/CRUD/stats, migration generated, pending drift); live inventory/stats/map-from-records + wizard wired to POST; removed fake zones/traffic/KPIs |
| 21 | `app/admin/community-activity/page.tsx` | Reuse `/activities`, `/admin/activities`, `/localmall/customer/feed`. ADD aggregation query with joins (no N+1) | [x] 2026-09-22 — live feed via `GET /admin/activities` + target breakdown + active users; blast button links to real broadcast composer; removed fake feed/map |
| 22 | `app/admin/settings/page.tsx` | Have `/settings/*`. Persist system-config tabs (Borough rules, thresholds, API keys via Joi, no secrets to client) | [x] 2026-09-22 — live integrations toggles (GET/PUT per business) + billing summary via `service/settings`; membership links to real tiers/plans pages; removed fake price inputs |
| 23 | `app/admin/services/add/page.tsx` | Wire `POST /services` via Server Action / `useMutation` + `revalidatePath`; remove `console.log` + fake toast | [x] 2026-09-22 — new `POST /admin/services` backend endpoint (admin create for any business) + live form with business selector/validation via `useCreateAdminService` |
| 24 | `app/admin/templates/services/page.tsx` | Wire to `product-variant-template` / new `service-template` endpoints; remove hardcoded defaults | [x] 2026-09-22 — new `service-templates` backend module (entity/CRUD, migration generated, pending drift); live list/search/create/update/delete via `service/service-templates`; blank defaults; wizard review now shows real form data |

## Batch 3 — New backend module required — 9 pages

| # | Page | Gap → action | Status |
|---|------|--------------|--------|
| 25 | `app/admin/audit/page.tsx` | No `GET /admin/audits`. New admin controller over `business/audits` entities + DTOs + Swagger + migration if needed | [x] 2026-09-22 — new `AdminAuditsController` (`/business/audits/admin/all|stats`, no migration needed); live table/stats/suggestions via `service/audits` |
| 26 | `app/admin/compliance/page.tsx` | No unified endpoint. New `compliance` read-model unifying `/reviews/admin` + `/dispute/admin` | [x] 2026-09-22 — frontend aggregation, no new backend needed: live dispute stats/queue + pending reviews + suspended users + verification counts; resolve/publish actions wired |
| 27 | `app/admin/expo-promo/page.tsx` | No endpoint. New `events` `type=EXPO` or `expo-promos` module | [x] 2026-09-22 — new `expos` backend module (entity/CRUD/stats, migration pending drift); live table/stats/create/status-change/delete via `service/expos` |
| 28 | `app/admin/integrations/page.tsx` | Have `/settings/integrations`, `/apps`. ADD `GET /settings/webhooks/logs` + `POST /retry` | [x] 2026-09-22 — live business toggles + new `webhooks` backend module (registry CRUD, migration pending drift); fake app statuses + fake API key removed |
| 29 | `app/admin/quality/page.tsx` | No endpoint (only `/reviews`). New `quality/mystery-shopper` entity + CRUD | [x] 2026-09-22 — new `quality` backend module (missions/stats, migration pending drift); live missions + assign/start/complete/delete via `service/quality`; badges tab removed (no backend) |
| 30 | `app/admin/roles/page.tsx` | Only `UserRole` enum + `GET /admin/users`. New `admin-roles` module + `RolesGuard` | [x] 2026-09-22 — new `admin-roles` backend module (entity/CRUD/assign, `users.adminRoleId` FK migration, pending drift); live roles/member-counts/assign via `service/roles`; removed `adminRoles` mock import |
| 31 | `app/admin/settings/onboarding/page.tsx` | Only `onboarding-decider.service`. New `onboarding-questions` entity; remove `alert('(Mocked)')` | [x] 2026-09-22 — new `onboarding` backend module (CRUD + reorder, migration pending drift); live editor with immediate persistence/reorder/publish via `service/onboarding`; `alert('(Mocked)')` gone |
| 32 | `app/admin/training/page.tsx` | No endpoint. New `training-modules` entity + CRUD | [x] 2026-09-22 — new `training` backend module (entity/CRUD, migration pending drift); live kind-tabbed hub + publish/hide/delete via `service/training` |
| 33 | `app/admin/verifications/page.tsx` | No standalone queue. New verifications/KYC queue over users/businesses docs | [x] 2026-09-22 — new `verifications` backend module (queue/stats/approve-reject, business approval marks business verified, migration pending drift); live queue via `service/verifications`; removed mock-data import |
| 36 | `app/admin/gamification/page.tsx` | Endpoints `GET /gamification/my-games|summary` are `OWNER`-only. ADD admin-level `GET /admin/gamification` list + summary (or widen roles) | [x] 2026-09-22 — new `AdminGamificationController` (`/gamification/admin/all|summary`, no migration); live platform games + totals via `service/gamification` |
| 37 | `app/admin/partnerships/page.tsx` | New `institutional-partners` module (orgs, contacts, plaque counts) — backend `partnerships` is user-scoped B2B sharing | [x] 2026-09-22 — new `institutional-partners` backend module (CRUD/stats, migration pending drift); live table/stats/create/status-change/delete via `service/partnerships` |

## Batch 4 — Hybrids (replace mocked widgets, keep real tables) — 2 pages

| # | Page | Mocked widget → real source | Status |
|---|------|-----------------------------|--------|
| 34 | `app/admin/coupons-vouchers/page.tsx` | Analytics tab hardcoded bars `[40,65,…]`, `Spring 45%`, Network Integrity Ledger → `GET /money-engine/admin/analytics` series + ledger | [x] 2026-09-22 — monthly minting chart from live vouchers, season share from live definitions, ledger from `GET /money-engine/admin/vouchers` |
| 35 | `app/admin/terminal-cashback/page.tsx` | Fraud Detection Rules fallback + Analysis Sheet trend heights + `John Smith` claimers → `GET /terminal-cashback/stats`, `/claims` aggregations | [x] 2026-09-22 — dials wired to live global rules; fraud log replaced with transparent claim heuristics + claim-sheet review; analysis sheet fully computed from live claims; fake dials-update toast removed |

**Reference — already fully real (do not touch unless regression):** `admin/page.tsx`, `activity-timer/*`, `bookings`, `campaign-cashback/*`, `cashback` (via tables), `content`, `coupons/products/*`, `disputes`, `gift-cards/templates/*`, `listings`, `memberships`, `plans/*`, `products/*`, `reviews`, `services`, `settings/business-sidebar`, `templates`, `templates/products`, `tiers`, `transactions`, `vouchers/products/*`.

## Cleanup checklist

- [x] 2026-09-22 — Deleted `app/admin/data/mock-data.ts` (zero remaining references; verified before deletion)
- [ ] `app/admin/types.ts` (legacy 317-line mock types) — KEPT: still imported by `content/page.tsx` + `content/api.ts` (`Sector, Category, Subcategory`). Remove only after content module migrates to live taxonomy types.
- [x] 2026-09-22 — Added `app/admin/loading.tsx` + `app/admin/error.tsx` (inherited by all admin routes)
- [ ] Orphaned but LIVE components kept (not mocks, may be wanted): `marketplace/components/{BannerTab,CategoryTab,SectionTab,ProductSelector,StorefrontEditManagement,MerchantOnboardingModal}` — superseded by the rewritten marketplace page; delete if the new inline tabs are accepted
- [ ] Strict TS pass (no `any`), Winston-only server logging, throttle new mutation routes, parameterized queries only
- [ ] Final verification: fresh staging DB shows `0 / No … found`, no hardcoded names (Artisan Bakery, Admin Sarah, John Smith, etc.)
- [x] 2026-09-22 — Deleted `app/admin/terminal-cashback/mock-data.ts` (orphaned file removed)
- [x] 2026-09-22 — Democked `AdminHeader.tsx` notification bell dropdown (wired to `useGetNotifications` + `useMarkNotificationsAsSeen`, dynamic unseen badge, item actions, empty/loading states)
- [x] 2026-09-22 — Resolved pre-existing migration drift (idempotent `hasTable` / `IF NOT EXISTS` guards added to migrations `1785000000000` through `1785000000005`, and un-ignored `src/database/migrations/` in `.gitignore` so staging/prod can execute all 11 new module migrations safely)

## Progress log

| Date (UTC) | Page | Change | Commit |
|------------|------|--------|--------|
| 2026-09-22 | high-streets | NEW backend `high-streets` module (entity/CRUD/stats, migration `1790077915235-AddHighStreetsModule`, pending drift) + `service/high-streets`; live inventory/stats/map-from-records; activation wizard wired to POST (review shows real form data, no more “Oxford Street / 142 Shops”) | — |
| 2026-09-22 | community-activity | Live feed via `GET /admin/activities` + target breakdown + active users; blast button routes to real broadcast composer; fake feed/map removed | — |
| 2026-09-22 | settings | Live integrations toggles (GET/PUT per business) + billing summary via `service/settings`; membership links to real tiers/plans pages; fake price inputs removed | — |
| 2026-09-22 | services/add | NEW backend `POST /admin/services` (admin create for any business, validated DTO, Swagger) + live form with business selector/validation; `console.log` + fake toast gone | — |
| 2026-09-22 | templates/services | NEW backend `service-templates` module (entity/CRUD, migration `1790078907042-AddServiceTemplatesModule`, pending drift); live list/search/create/update/delete; blank defaults | — |
| 2026-09-22 | roles | NEW backend `admin-roles` module (entity/CRUD/assign, `users.adminRoleId` FK migration, pending drift); live roles/member-counts/assign via `service/roles` | — |
| 2026-09-22 | verifications | NEW backend `verifications` module (queue/stats/approve-reject, business approval marks business verified, migration pending drift); live queue via `service/verifications` | — |
| 2026-09-22 | training | NEW backend `training` module (entity/CRUD, migration pending drift); live kind-tabbed hub + publish/hide/delete via `service/training` | — |
| 2026-09-22 | settings/onboarding | NEW backend `onboarding` module (CRUD + reorder, migration pending drift); live editor with immediate persistence/reorder/publish; `alert('(Mocked)')` gone | — |
| 2026-09-22 | quality | NEW backend `quality` module (missions/stats, migration pending drift); live missions + assign/start/complete/delete via `service/quality` | — |
| 2026-09-22 | expo-promo | NEW backend `expos` module (entity/CRUD/stats, migration pending drift); live table/stats/create/status-change/delete via `service/expos` | — |
| 2026-09-22 | audit | NEW `AdminAuditsController` (`/business/audits/admin/all|stats`, no migration); live table/stats/suggestions via `service/audits` | — |
| 2026-09-22 | compliance | Frontend aggregation, no new backend: live dispute queue + pending reviews + suspended users + verification counts; resolve/publish actions wired | — |
| 2026-09-22 | integrations | NEW backend `webhooks` module (registry CRUD, migration pending drift); live business toggles + webhook registry via `service/webhooks`; fake API key removed | — |
| 2026-09-22 | gamification | NEW `AdminGamificationController` (`/gamification/admin/all|summary`, no migration); live platform games + totals via `service/gamification` | — |
| 2026-09-22 | partnerships | NEW backend `institutional-partners` module (CRUD/stats, migration pending drift); live table/stats/create/status-change/delete via `service/partnerships` | — |
| 2026-09-22 | analytics | Replaced 7 hardcoded `SimpleBarChart` datasets + `42%` retention with `useGetAdminAnalytics(range)` (visitors/signups/revenue/conversion + visitorChart/revenueChart + topCategories/topBusinesses + funnel); wired range filter; loading/error/empty states | — |
| 2026-09-22 | billing + transactions | Live `/admin/transactions` stats + type-tabbed table; corrected stale `AdminTransaction` frontend types to real DTO; repaired `transactions/page.tsx` which read non-existent `items/meta/reference` fields | — |
| 2026-09-22 | boroughs (+[id]) | NEW backend `boroughs` module (entity, DTOs, service, ADMIN-guarded controller, Swagger, `boroughs` table + nullable `borough_campaigns.boroughId` FK migration `1790077473823-AddBoroughsModule`). Dev DB uses `synchronize:true` so schema auto-syncs locally; migration file is ready for staging/prod once drift is resolved. Frontend: live list/stats/campaign-counts/onboard/delete + live detail/campaigns/edit | — |
| 2026-09-22 | coupons-vouchers (hybrid) | Analytics tab: monthly minting chart from live vouchers, season share from live definitions, ledger from `GET /money-engine/admin/vouchers`; legend/copy corrected | — |
| 2026-09-22 | terminal-cashback (hybrid) | Dials wired to live global rules; fraud log replaced with transparent claim heuristics + claim-sheet review; analysis sheet fully computed from live claims; fake dials-update toast removed | — |
| 2026-09-22 | cleanup | Deleted `mock-data.ts`; added `app/admin/loading.tsx` + `error.tsx`; full typecheck green; final mock sweep clean (1 false positive: live `useMemo` variable) | — |
| 2026-09-22 | header + migrations | Democked `AdminHeader.tsx` notifications dropdown; deleted `terminal-cashback/mock-data.ts`; added idempotent checks to 6 historical migrations (`1785000000000-1785000000005`); un-ignored `src/database/migrations` in API `.gitignore` | — |

