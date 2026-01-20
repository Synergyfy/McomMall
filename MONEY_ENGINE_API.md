# Money Engine API Documentation

## Overview
The **Money Engine** is a closed-loop voucher system that allows users to purchase "Spending Power" (Vouchers) using Real Money. The system automatically mints "Reward Money" based on configured rules (e.g., 50% Real / 50% Reward split) and tracks the balance within a digital wallet.

Key concepts:
- **Real Money**: Funds verified via Stripe/PayPal.
- **Reward Money**: Bonus value added by the system or businesses.
- **Closed Loop**: Vouchers can only be spent at authorized shops within the MCOM ecosystem.
- **Split Ratio**: Defines how much of the voucher's total value is covered by user payment vs. system reward.

---

## 💳 Payment & Verification Flow

This is the sequence required for a customer to purchase a voucher. The system **verifies** payment with the gateway before minting the voucher.

### Step 1: Initiate Payment (Frontend)
Use the existing Payments API to create a transaction intent.

**Option A: Stripe**
*   **Endpoint**: `POST /payments/stripe/create-intent`
*   **Body**: `{ "amount": 50 }`
*   **Response**: Returns `clientSecret`. Use Stripe Elements to complete the payment.

**Option B: PayPal**
*   **Endpoint**: `POST /payments/paypal/create-order`
*   **Body**: `{ "amount": 50 }`
*   **Response**: Returns `orderId`. Use PayPal Buttons to approve the payment.

### Step 2: Finalize & Mint (Frontend -> Backend)
Once the payment is successful on the client side, call the Money Engine to create the voucher.

*   **Endpoint**: `POST /money-engine/purchase`
*   **Authorization**: Bearer Token (Role: `CUSTOMER`)
*   **Payload**:
    ```json
    {
      "rewardDefinitionId": "uuid-of-the-voucher-template",
      "paymentAmount": 50,
      "transactionId": "pi_3M9...",  // Stripe Intent ID OR PayPal Order ID
      "paymentGateway": "STRIPE"     // Enum: "STRIPE" or "PAYPAL"
    }
    ```

### Step 3: Verification (Backend)
The backend will:
1.  Connect to Stripe/PayPal using the `transactionId`.
2.  Verify status is `succeeded` or `COMPLETED`.
3.  Verify the amount matches `paymentAmount`.
4.  **Success**: Mints voucher (e.g., £50 Real + £50 Reward = £100 Total). Returns voucher details.
5.  **Failure**: Throws `400 Bad Request`.

---

## 🛠️ API Endpoints

All endpoints are prefixed with `/api/v1/money-engine`.

### 1. Customer Endpoints 👤
*Role Required: `CUSTOMER`*

#### `POST /purchase`
Mints a new voucher after verifying payment.
- **Payload**: `PurchaseVoucherDto` (see above)
- **Response**: `UserVoucherResponseDto`
    ```json
    {
      "id": "uuid",
      "code": "SPRING2026XY",
      "totalBalance": 100.00,
      "state": "active",
      "definition": { ... }
    }
    ```

#### `GET /me`
Retrieves the logged-in user's voucher wallet.
- **Query Params**: `page` (number), `limit` (number)
- **Response**: Paginated list of vouchers.

#### `POST /spend`
Deducts funds from a voucher at a specific shop.
- **Payload**:
    ```json
    {
      "userVoucherId": "uuid",
      "amount": 25.00,
      "shopId": "uuid-of-shop"
    }
    ```
- **Logic**: Automatically burns Reward Money or Real Money based on the voucher's configured "Burn Strategy".

#### `POST /transfer`
Transfers voucher funds to another user.
- **Payload**:
    ```json
    {
      "fromVoucherId": "uuid-sender",
      "toVoucherId": "uuid-receiver",
      "amount": 10.00
    }
    ```
- **Logic**: Preserves the Real/Reward ratio during transfer.

---

### 2. Business Endpoints 💼
*Role Required: `OWNER`*

#### `GET /business/stats`
Returns performance metrics for the logged-in owner's primary business.
- **Response**:
    ```json
    {
      "totalSpentInShop": 1500.00,  // Total revenue from vouchers
      "customersCount": 45,         // Unique customers
      "cashbackGivenCount": 120     // Number of rewards given
    }
    ```

#### `GET /business/:shopId/stats`
Returns metrics for a specific shop ID (if owned by the user).

#### `POST /cashback`
Injects "Reward Money" into a customer's voucher.
- **Payload**:
    ```json
    {
      "userVoucherId": "uuid-customer-voucher",
      "amount": 5.00,
      "shopId": "uuid-your-shop"
    }
    ```

---

### 3. Admin Endpoints 🛡️
*Role Required: `ADMIN`*

#### `POST /definitions`
Creates a new "Deals" template (Reward Definition).
- **Payload**:
    ```json
    {
      "name": "Summer Expo Voucher",
      "splitRatio": { "real": 0.5, "reward": 0.5 },
      "visualType": "voucher", // or "coupon"
      "scopeType": "any_shop", // or "specific_shops"
      "isActive": true
    }
    ```

#### `PATCH /definitions/:id`
Updates a definition (e.g., to disable a campaign).
- **Payload**: `{ "isActive": false }`

#### `GET /admin/definitions`
Lists all reward templates. (Paginated)

#### `GET /admin/vouchers`
Master audit list of all issued vouchers. (Paginated)
- **Response**: Includes owner email, breakdown of Real/Reward balance, and status.

#### `GET /admin/analytics`
Platform-wide financial health check.
- **Response**:
    ```json
    {
      "activeVouchers": { "value": 1200, "percentageChange": 5.2 },
      "realMoneyInput": { "value": 50000, "percentageChange": 10.5 },
      "rewardValueGiven": { "value": 50000, "percentageChange": 10.5 },
      "networkUtilization": { "value": 45.0, "percentageChange": 2.1 } // % of issued funds spent
    }
    ```

---

## 📚 Enums & Types

### `PaymentGateway`
*   `STRIPE`
*   `PAYPAL`

### `PaymentPurpose` (Recorded in Payment History)
*   `MEMBERSHIP`
*   `VOUCHER_PURCHASE`
*   `PAYG_TOPUP`

### `VisualType`
*   `coupon`
*   `voucher`

### `ScopeType`
*   `any_shop`
*   `specific_shops`
*   `expo_only`
*   `campaign_only`
