# Voucher API

This document outlines the API endpoints for managing and using vouchers.

## Voucher Product Management (for Business Owners)

### Create a new Voucher Product

Creates a new template for vouchers that can be sold.

- **Endpoint:** `POST /voucher-products`
- **Authentication:** Required (Business Owner)
- **Request Body:**

```typescript
interface CreateVoucherProductDto {
  name: string;
  description?: string;
  fixedAmounts?: number[];
  allowCustomAmount?: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  usage?: 'online_only' | 'instore_only' | 'both';
  isEnabled?: boolean;
  expiryDays?: number;
  allowPartialRedemption?: boolean;
}
```

- **Success Response:** `201 Created` with the new voucher product object.
- **Error Responses:**
  - `400 Bad Request`: If the request body is invalid.
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a business owner.

### Update a Voucher Product

Updates an existing voucher product.

- **Endpoint:** `PATCH /voucher-products/:id`
- **Authentication:** Required (Business Owner)
- **Request Body:**

```typescript
interface UpdateVoucherProductDto {
  name?: string;
  description?: string;
  fixedAmounts?: number[];
  allowCustomAmount?: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  usage?: 'online_only' | 'instore_only' | 'both';
  isEnabled?: boolean;
  expiryDays?: number;
  allowPartialRedemption?: boolean;
}
```

- **Success Response:** `200 OK` with the updated voucher product object.
- **Error Responses:**
  - `400 Bad Request`: If the request body is invalid.
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user does not own the voucher product.
  - `404 Not Found`: If the voucher product with the given ID does not exist.

## Voucher Purchase (for Consumers)

### Initiate a Voucher Purchase

Initiates the payment process for buying a voucher.

- **Endpoint:** `POST /vouchers/purchase/initiate`
- **Authentication:** Required
- **Request Body:**

```typescript
interface InitiateVoucherPurchaseDto {
  voucherProductId: string;
  amount: number; // Can be a fixed amount or a custom amount if enabled
  paymentProvider: 'stripe' | 'paypal';
  recipientName?: string;
  recipientEmail?: string;
  personalMessage?: string;
  deliveryDate?: string; // ISO 8601 format
}
```

- **Success Response:** `200 OK` with a payment client secret (for Stripe) or an order ID (for PayPal).
- **Error Responses:**
  - `400 Bad Request`: If the amount is invalid or the payment provider is not supported.
  - `404 Not Found`: If the voucher product is not found or inactive.

### Verify and Complete a Voucher Purchase

Verifies the payment and creates the voucher.

- **Endpoint:** `POST /vouchers/purchase/verify`
- **Authentication:** Required
- **Request Body:**

```typescript
interface VerifyVoucherPurchaseDto {
  transactionId: string; // Stripe Payment Intent ID or PayPal Order ID
  paymentProvider: 'stripe' | 'paypal';
  purchaseDetails: {
    voucherProductId: string;
    amount: number;
    recipientName?: string;
    recipientEmail?: string;
    personalMessage?: string;
    deliveryDate?: string;
  };
}
```

- **Success Response:** `201 Created` with the newly created voucher object.
- **Error Responses:**
  - `400 Bad Request`: If payment verification fails.
  - `404 Not Found`: If the voucher product is not found.