# Coupon & Campaign System Refactor Documentation

## Overview
The coupon system has been transformed from a basic, unstructured model into a robust, **Platform-Controlled Marketing Engine**. This refactor introduces hierarchical governance, hyperlocal targeting, and strict transactional integrity to prevent abuse and ensure scalable growth.

---

## 1. Architectural Shift
We moved from a "Coupon-only" model to a **Domain-Driven Design** consisting of two core layers:

### A. Marketing Campaigns (The Container)
Managed exclusively by Platform Admins. Campaigns define the boundaries (time, location, and type) for coupons.
- **Seasonal:** Formal integration with the **Season Module**. Campaigns can be linked to a specific `Season` ID, inheriting its `startDate` and `endDate` automatically.
- **Hyperlocal:** Targeted at specific geographic regions using UK Postal Code prefixes.
- **National:** Wide-reaching promotions across the entire platform.

### B. Coupon Engine (The Asset)
... (rest of the file)
Coupons are the individual assets used by consumers.
- **Platform Source:** High-authority coupons created by admins for site-wide events.
- **Business Source:** Coupons created by qualified businesses (e.g., Platinum Tier) for their own listings.
- **Branded Platform Coupons:** A hybrid allowing businesses to "adopt" a platform campaign while maintaining the platform's immutable logic.

---

## 2. Technical Implementation

### Database Schema
- **MarketingCampaign:** Stores campaign lifecycle, status, and `targetPostalCodes`.
- **Coupon:** Stores discount value, type (Fixed/Percentage), limits, and relations to campaigns/businesses.
- **RedemptionLog:** An immutable audit trail tracking every usage attempt (Success/Rejected/Fraud).
- **BrandingAssociation:** Maps custom business branding to platform-standard campaigns.

### Security & Integrity
1. **Transactional Locking:** Redemptions use **Pessimistic Write Locking** to prevent race conditions during high-traffic events (e.g., the last coupon being claimed by two people simultaneously).
2. **Strict Anti-Stacking:** The system explicitly blocks the usage of multiple coupons in a single checkout.
3. **Capability Enforcement:** Business-created coupons are only valid if the business maintains a tier with the `CREATE_COUPON_TEMPLATE` capability.

---

## 3. Targeting Logic: Hyperlocal vs. National

### Hyperlocal Validation
For campaigns marked as `HYPERLOCAL`:
1. The system fetches the user's `isMain` shipping address.
2. It normalizes the user's postal code (removes spaces, uppercase).
3. It performs a **Prefix Match** against the campaign's `targetPostalCodes` array (e.g., `SW1A 1AA` matches prefix `SW1A`).
4. If no match is found, the coupon is rejected.

---

## 4. API & Swagger Documentation
Every endpoint is fully documented with:
- **Detailed Descriptions:** Explaining the logic and purpose.
- **Role Requirements:** Clearly stating if `ADMIN`, `OWNER`, or `CUSTOMER` access is required.
- **Security Context:** Guarded endpoints are marked with a padlock icon in Swagger.
- **Rich Interfaces:** Payloads and Responses are explicitly typed with TypeScript interfaces, enum options, and required/optional field indicators.

---

## 5. Pagination & Scalability
All fetch/list endpoints now utilize a standardized pagination pattern:
- **Request:** `page`, `limit` parameters.
- **Response:** `PageDto<T>` containing:
  - `data`: The array of results.
  - `meta`: Metadata including `totalItems`, `totalPages`, `currentPage`, `hasNextPage`, etc.

---

## 6. Maintenance & Performance
- **Indexed Lookups:** Critical columns like `code`, `status`, `postalCodes`, and Foreign Keys are indexed to ensure sub-millisecond query performance.
- **Legacy Compatibility:** Bridges were created for `OrderService` and `WalletService` to ensure the system remains functional with the existing UI while using the new logic.

---

## 7. Season Module Integration
To ensure platform-wide consistency, the Marketing Campaign system is now formally integrated with the existing **Season Module**:
- **Automatic Sync:** When creating or updating a campaign with a `seasonId`, the campaign's `startDate` and `endDate` are automatically overwritten by the corresponding Season's boundaries.
- **Data Integrity:** This prevents mismatches between a marketing campaign and the season it represents (e.g., a "Summer Sale" accidentally starting in Spring).
