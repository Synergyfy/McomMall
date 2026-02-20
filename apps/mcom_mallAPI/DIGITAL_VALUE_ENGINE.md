# Digital Value Engine (Unified Gift Card & Voucher System)

## 1. Overview & Storyline

**The Vision:**
In the past, the McomMall platform treated Gift Cards and Vouchers as entirely separate entities. This led to fragmented data, duplicate logic, and a difficult experience for developers trying to maintain financial integrity.

**The Solution:**
We introduced the **Unified Digital Value Engine**. Imagine a single, secure vault (`DigitalValueMaster`) that holds all stored value instruments. Whether a user buys a Gift Card for a friend or earns a Voucher from a loyalty reward, the underlying engine treats them as the same asset type—just with different labels and rules.

**How it works (The Story):**

1.  **Creation (The Minting):**
    *   A customer buys a Gift Card via the checkout page.
    *   Behind the scenes, the legacy `GiftCardService` contacts the **Digital Value Engine**.
    *   The Engine mints a new `DigitalValueMaster` record with a unique code and the purchased value.
    *   It hands this code back to the `GiftCardService`, which creates the customer-facing Gift Card record linked to that code.
    *   *Result:* A single source of truth for the money (The Engine) and a flexible presentation layer (The Gift Card).

2.  **Funding (The Top-Up):**
    *   The customer decides to reload their card.
    *   The system verifies the payment and tells the Engine: "Add £50 to instrument `CODE123`."
    *   The Engine records a `FUND` transaction in its immutable ledger (`DigitalValueTransaction`) and updates the master balance.
    *   The legacy service mirrors this update for the UI.

3.  **Redemption (The Spending):**
    *   The customer visits a merchant and wants to pay with their Voucher.
    *   The merchant scans the code.
    *   The system asks the Engine: "Can `CODE123` spend £20 at Merchant X?"
    *   The Engine checks:
        *   Is the balance sufficient?
        *   Is the instrument expired?
        *   Is it linked *only* to Merchant Y? (If so, block it).
    *   If all checks pass, the Engine deducts the amount, logs a `REDEEM` transaction, and confirms success.

This unified approach ensures that **money is never lost or double-spent**, regardless of whether it's called a "Gift Card" or a "Voucher".

---

## 2. API Endpoints

### A. Consumer Endpoints
*Accessible by: Authenticated Customers*

#### 1. Get My Instruments
Retrieves all digital value instruments (Gift Cards/Vouchers) owned by the user.
- **GET** `/api/v1/digital-value/consumer`
- **Response:** Array of `DigitalValueMaster` objects.

#### 2. Get Instrument Details
- **GET** `/api/v1/digital-value/consumer/{id}`
- **Response:** Single `DigitalValueMaster` object.
- **Error:** `403 Forbidden` if not owner.

#### 3. Get Transaction History
- **GET** `/api/v1/digital-value/consumer/{id}/transactions`
- **Response:** Array of `DigitalValueTransaction` objects (fund, redeem, top-up).

#### 4. Fund Instrument (Top-Up)
- **POST** `/api/v1/digital-value/consumer/{id}/fund`
- **Payload:** `FundDigitalValueDto`
- **Response:** Updated `DigitalValueMaster`.

#### 5. Link Merchant
Permanently restricts an instrument to a specific merchant.
- **POST** `/api/v1/digital-value/consumer/{id}/link`
- **Payload:** `LinkMerchantDto`
- **Response:** Updated `DigitalValueMaster`.

---

### B. Business Endpoints
*Accessible by: Authenticated Business Owners*

#### 1. Get Merchant Instruments
Retrieves instruments linked explicitly to a merchant owned by the user.
- **GET** `/api/v1/digital-value/business/merchant/{merchantId}/instruments`

#### 2. Get Merchant Transactions
Retrieves redemption history for the merchant.
- **GET** `/api/v1/digital-value/business/merchant/{merchantId}/transactions`

#### 3. Redeem Customer Instrument
Process a payment using a customer's code.
- **POST** `/api/v1/digital-value/business/merchant/{merchantId}/redeem/{id}`
- **Payload:** `RedeemDigitalValueDto`
- **Response:** Updated `DigitalValueMaster` (new balance).
- **Error:** `400 Bad Request` if insufficient funds or wrong merchant.

---

### C. Admin Endpoints
*Accessible by: Admins*

#### 1. Get All Instruments
Audit view of all value in the system.
- **GET** `/api/v1/digital-value/admin`

#### 2. Create Instrument (Manual Issue)
Manually issue a gift card or voucher (e.g., for support).
- **POST** `/api/v1/digital-value/admin`
- **Payload:** `CreateDigitalValueDto`

---

## 3. Data Interfaces

### Payloads

**CreateDigitalValueDto**
```typescript
export interface CreateDigitalValueDto {
  type: 'gift_card' | 'voucher';
  initialValue: number; // e.g., 100.00
  merchantId?: string; // Optional: Lock to merchant
  ownerId?: string; // Optional: Assign to user
  expiryDate?: string; // ISO Date
  rewardId?: string; // Optional: Link to reward definition
  metadata?: any; // JSON
}
```

**RedeemDigitalValueDto**
```typescript
export interface RedeemDigitalValueDto {
  amount: number; // e.g., 25.50
  merchantId: string; // The merchant processing the redemption
}
```

### Responses

**DigitalValueMaster**
```typescript
export interface DigitalValueMaster {
  id: string;
  code: string; // Unique 16-char code
  type: 'gift_card' | 'voucher';
  currentBalance: number;
  status: 'draft' | 'funded' | 'active' | 'partially_redeemed' | 'fully_redeemed' | 'expired';
  expiryDate: string | null;
  ownerId: string;
  merchantId: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}
```

---

## 4. Error Handling

| HTTP Code | Error Message | Reason |
| :--- | :--- | :--- |
| **400** | `Insufficient balance` | Redemption amount exceeds current balance. |
| **400** | `Instrument has expired` | Attempted to use/fund an expired code. |
| **400** | `This instrument is only valid for a specific merchant` | General redemption attempted at wrong merchant. |
| **403** | `You do not own this instrument` | Consumer tried to access another user's card. |
| **403** | `You do not own this merchant` | Business user tried to view data for another shop. |
| **404** | `Digital value instrument not found` | Invalid ID or Code. |
