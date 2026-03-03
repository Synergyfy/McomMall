# Royal Mail Shipping Integration Design

This document outlines the design for integrating Royal Mail's Shipping and Tracking APIs into the Mcom Mall system to facilitate seamless shipping for business owners and real-time tracking for customers in the UK.

## 1. Overview
The integration will allow:
- **Business Owners**: To generate Royal Mail shipping labels directly from the admin dashboard after an order is paid.
- **Customers**: To track their package's journey from dispatch to delivery within the Mcom Mall application.
- **System**: To automatically update order and shipping statuses based on Royal Mail's tracking events.

## 2. Key Components

### 2.1 API Integration
We will integrate with two primary Royal Mail APIs:
1.  **Shipping API (Pro Shipping / Click & Drop)**: For creating shipments and generating labels.
2.  **Tracking API**: For retrieving real-time status updates for a given tracking number.

### 2.2 Data Model Updates
- **Order Entity**:
    - `shippingAddress`: Link to the selected `ShippingAddress` or embedded fields to ensure the destination is preserved even if the user deletes the address from their profile.
    - `royalMailShipmentId`: Internal Royal Mail reference.
    - `royalMailLabelData`: Base64 or URL for the generated label.
    - `trackingNumber`: Royal Mail tracking reference (already exists).
    - `shippingStatus`: (In Transit, Out for Delivery, Delivered, etc.).
- **Product Entity**:
    - Ensure `weight`, `length`, `width`, and `height` are accurately populated as they are required for Royal Mail rate and service selection.

## 3. Workflow

### 3.1 Order Placement & Checkout
1.  **Shipping Address**: During checkout, the customer selects a UK shipping address.
2.  **Service Selection**: The system calculates available Royal Mail services (e.g., Tracked 24, Tracked 48, Special Delivery) based on the total weight and dimensions of the items.
3.  **Shipping Fee**: The estimated shipping fee is added to the order total.

### 3.2 Label Generation (Business Owner Action)
1.  **Order Paid**: Once an order status becomes `PAID` or `COMPLETED` (payment verified), it appears in the Business Owner's "Awaiting Shipment" list.
2.  **Prepare Shipment**: The business owner clicks "Generate Royal Mail Label".
3.  **API Call**: The backend `RoyalMailService` calls the Royal Mail Shipping API:
    - Sends sender address (Business location) and recipient address (Order shipping address).
    - Sends package details (Weight, Dimensions).
    - Receives a `trackingNumber` and `labelData` (PDF/ZPL).
4.  **Update Order**: The system updates the `Order` with the tracking number, label, and sets `shippingStatus` to `LABEL_GENERATED`.
5.  **Print Label**: The business owner downloads and prints the label.

### 3.3 Dispatch
1.  **Mark as Shipped**: When the business owner hands the package to Royal Mail, they mark it as "Dispatched" (or this can be automated when the label is scanned by Royal Mail).
2.  **Notification**: The customer receives an email/push notification that their order is on its way.

### 3.4 Tracking & Delivery
1.  **Tracking Job**: A scheduled background job (e.g., every 4 hours) polls the Royal Mail Tracking API for all orders with `shippingStatus` not yet `DELIVERED`.
2.  **Status Mapping**:
    - `Accepted` -> `SHIPPED`
    - `In Transit` -> `IN_TRANSIT`
    - `Out for Delivery` -> `OUT_FOR_DELIVERY`
    - `Delivered` -> `DELIVERED`
3.  **Customer Visibility**: The customer can see these status updates in their "My Orders" section with a progress bar and historical timestamps.

## 4. Technical Architecture

### 4.1 RoyalMailService (NestJS)
A new service in `apps/mcom_mallAPI/src/resources/shipping/royal-mail.service.ts` will handle:
- **Authentication**: Managing OAuth2 tokens for Royal Mail API.
- **Shipment Creation**: `createShipment(order: Order)`
- **Label Retrieval**: `getLabel(shipmentId: string)`
- **Tracking**: `getTrackingStatus(trackingNumber: string)`

### 4.2 Integration Point
The existing `ShippingService` will be refactored to act as a gateway:
- If `carrierCode === 'royalmail'`, delegate to `RoyalMailService`.
- Maintain support for other carriers (like ShipStation) for international or alternative domestic shipping.

## 5. Implementation Steps (Phased)
1.  **Phase 1: Foundation**: Update entities and implement `RoyalMailService` with basic authentication and shipment creation.
2.  **Phase 2: Admin UI**: Update `McomMallAdmin` to show "Generate Label" button and handle PDF display/download.
3.  **Phase 3: Tracking**: Implement the background polling job and update the Customer UI to show tracking details.
4.  **Phase 4: Optimization**: Implement Webhooks (if Royal Mail supports them) for real-time updates and handle manifesting requirements.

## 7. Royal Mail API Endpoints

The integration will utilize the **Royal Mail Shipping API V3** and the **Tracking API V2/V3**.

### 7.1 Base URLs
- **Shipping (V3):** `https://api.royalmail.net/shipping/v3`
- **Tracking (V2):** `https://api.royalmail.net/tracking/v2`

### 7.2 Authentication
Authentication requires a Client ID and Client Secret. A JWT token must be retrieved and used for subsequent requests.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/token` | Authenticate and retrieve a JWT (`xRMGAuthToken`). |

### 7.3 Shipping & Label Generation (V3)
These endpoints manage the creation of shipments and retrieval of labels.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/shipments` | Create a new domestic or international shipment. Returns a `shipment_id` and `tracking_number`. |
| `GET` | `/shipments/{id}` | Retrieve details of a specific shipment. |
| `GET` | `/labels/{id}` | Retrieve the shipping label for a shipment (returns PDF or PNG data). |
| `POST` | `/manifests` | Manifest shipments (required for certain services to finalize the billing and notify Royal Mail of pickup). |

### 7.4 Tracking (V2)
Tracking endpoints provide real-time updates on the progress of a parcel.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/mailpieces/{trackingNumber}/summary` | Retrieve current status (e.g., Delivered, Out for Delivery). |
| `GET` | `/mailpieces/{trackingNumber}/history` | Retrieve full audit trail of tracking events for the customer timeline. |

## 9. The "Butter-Smooth" User Journeys

To ensure a seamless experience for all parties, the system follows these specific, automated workflows:

### 9.1 The Customer Experience (The Buyer)
*Goal: Confidence and transparency from checkout to doorstep.*
1.  **Address Autocomplete**: As the customer types their UK address, the system provides Royal Mail-validated suggestions, preventing delivery failures.
2.  **Service Choice**: At checkout, the customer sees clear options: "Royal Mail Tracked 24 (Next Day)" or "Royal Mail Tracked 48 (2-3 Days)" with accurate pricing.
3.  **One-Click Tracking**: No more copying tracking numbers. The "My Orders" page features a live progress bar.
4.  **Real-Time Alerts**: The customer receives a push notification/email when the parcel is "Out for Delivery" and immediately upon "Delivery" (including a photo if provided by RM).

### 9.2 The Business Owner Experience (The Seller)
*Goal: Zero data entry and rapid fulfillment.*
1.  **Shipping-Ready Dashboard**: Orders needing shipment are clearly flagged. The system pre-calculates the package type (e.g., "Small Parcel") based on product data.
2.  **Bulk Label Generation**: The owner can select 10 orders at once and click "Generate Labels." The system calls the RM API in parallel and returns a single PDF containing all 10 labels.
3.  **Thermal Printing Support**: Labels are formatted specifically for 4x6 thermal printers (Zebra/Dymo) for "peel and stick" speed.
4.  **The "End-of-Day" Manifest**: With one click, the owner "Manifests" all shipments. This electronically notifies Royal Mail and generates the required paperwork for the collection driver.

### 9.3 The Platform Admin Experience (The Overseer)
*Goal: Global control and financial accuracy.*
1.  **Carrier Configuration**: A central UI to manage Royal Mail API keys, account numbers, and secret tokens.
2.  **Shipping Rule Engine**: The Admin can set global margins (e.g., "Charge customers RM rate + 10% for packaging") and define weight/price brackets.
3.  **Failed Shipment Monitor**: A "Command Center" view showing any labels that failed to generate (e.g., due to API downtime) with a "Force Retry" button.
4.  **Financial Reconciliation**: Automated reports showing the "Collected Shipping Fee" vs. "Actual Royal Mail Cost," ensuring the platform remains profitable.

## 10. Advanced Technical Considerations

To move from a prototype to a production-grade system, we will implement:

1.  **Address Validation**: Integrating the Royal Mail PAF (Postcode Address File) API during checkout to ensure 100% address accuracy.
2.  **Dynamic Rule Engine**: A logic layer that maps `Total Weight + Total Dimensions` to Royal Mail's specific package categories (Large Letter, Small Parcel, Medium Parcel).
3.  **Webhooks for Tracking**: Moving away from polling. We will set up a Webhook listener to receive instant updates from Royal Mail when a parcel's status changes.
4.  **Label Storage**: Generated PDFs will be stored in an S3-compatible bucket, with the DB only holding the secure, signed URL.
5.  **Multi-Parcel Logic**: Allowing the Business Owner to split a single large order into multiple Royal Mail shipments if they don't fit in one box.

## 11. Robustness & Reliability Strategy

To ensure the system never loses a shipment or double-charges a merchant, we will implement the following:

### 11.1 API Idempotency
- **The Problem**: A network glitch occurs after a label is created but before the DB is updated, leading the merchant to click "Generate" again.
- **The Solution**: We will use the `Order ID` as an idempotency key in all Royal Mail API calls. If the same ID is sent twice, Royal Mail returns the existing shipment instead of creating a new one.

### 11.2 Circuit Breaker Pattern
- **The Problem**: If Royal Mail's API is slow or down, it could hang our entire Admin Dashboard.
- **The Solution**: We will implement a circuit breaker (e.g., using `opossum`). If RM fails multiple times, the "Generate Label" feature will gracefully disable and show a "Carrier API Temporarily Unavailable" message, preventing system-wide lag.

### 11.3 Asynchronous Label Generation
- Bulk label generation will be handled via a **Background Queue** (e.g., BullMQ). The merchant clicks "Generate 50 Labels," and the UI updates in real-time as the queue processes them, rather than making them wait for a single 30-second API call.

### 11.4 Secure Asset Handling
- Label URLs will be **Time-Limited Signed URLs**. This ensures that even if a label link is leaked, it expires within 15 minutes, protecting customer PII (names/addresses).

## 12. Detailed Test Plan

### 12.1 Unit Testing (Jest)
- **Weight/Size Engine**: Verify that 5x items weighing 500g each correctly trigger a "Medium Parcel" (2.5kg) service.
- **Status Mapper**: Ensure every Royal Mail status code (e.g., `DE1`, `EV1`) maps correctly to our internal statuses (`DELIVERED`, `IN_TRANSIT`).
- **Address Sanitizer**: Test that addresses with special characters or missing postcodes are caught before the API call.

### 12.2 Integration Testing (RM Sandbox)
- **Auth Flow**: Verify JWT token refresh logic works when the 4-hour window expires.
- **Label Retrieval**: Mock a successful RM response and verify the PDF is correctly uploaded to S3 and the URL is saved to the `Order`.
- **Manifesting**: Simulate a daily "Close Out" and verify the API returns the manifest document.

### 12.3 End-to-End (E2E) Testing
- **The "Full Loop"**: 
    1.  Place an order as a Customer.
    2.  Mark as Paid in Admin.
    3.  Generate RM Label as a Business Owner.
    4.  Verify the `shippingStatus` changes and the `trackingNumber` appears on the Customer's order page.

### 12.4 Edge Case Testing
- **Invalid Postcode**: Ensure the system displays a user-friendly error if a customer bypasses frontend validation.
- **Overweight Packages**: Test the behavior when an order exceeds the maximum 30kg Royal Mail limit (should trigger an "Exceeds Carrier Limit" warning for the Admin).
- **Partial Shipments**: Verify that shipping 2 out of 5 items correctly creates a shipment for only those 2 items.

### 12.5 User Acceptance Testing (UAT)
- **Merchant Speed Test**: Measure the time taken to generate 10 labels at once (Target: < 5 seconds).
- **Mobile Tracking**: Ensure the customer tracking progress bar is fully responsive and clear on iOS/Android.

## 13. Royal Mail API Requirements
- `client_id` and `client_secret` from Royal Mail API Portal.
- Royal Mail Shipping Account Number.
- Access to `shipping-api` and `tracking-api` scopes.
