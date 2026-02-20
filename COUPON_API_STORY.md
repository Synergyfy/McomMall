# The Tale of the Coupon Engine: An API Story

Welcome to the digital marketplace, where the **Coupon Engine** controls the ebb and flow of discounts. Here, we track exactly how our heroes (the admins, merchants, and shoppers) interact with the sacred Endpoints of the Coupon System. Each endpoint acts as a gate, heavily guarded by rules inherited directly from the majestic Product Requirements Document (PRD).

---

## 📖 Chapter 1: Forging the Artifact (Create Coupon)

**The Scene:** High atop the marketplace fortress, a Platform Admin prepares for the grand "Winter Sale." Alternatively, an elite Platinum Merchant, bearing the rare `CREATE_COUPON_TEMPLATE` capability, wishes to reward loyal local patrons. They approach the Forge.

**The Endpoint:** `POST /api/v1/coupons`

**Description:** This is the sacred forge where coupons are born. Depending on the creator's power and intent, the coupon becomes either a universally recognized `platform` coupon (bound to massive campaigns) or a restricted `business` coupon. The forge rigidly enforces tier-based capabilities for merchants, ensuring no lowly peasant-merchant can flood the system with invalid discounts. 

### 📜 The Blueprint (Payload Interface `CreateCouponDto`)
```typescript
interface CreateCouponDto {
  title: string;                  // e.g. "Winter Sale 2026"
  description?: string;           // Optional deep lore about the discount
  code: string;                   // The magic word, e.g. "WINTER26"
  sourceType: 'platform' | 'business'; // The bloodline of the coupon
  discountValue: number;          // The weight of the discount
  discountType: 'fixed' | 'percentage';// How it alters reality
  usageLimit?: number;            // Total allowed global uses (0 = infinite)
  perUserLimit?: number;          // How many times a single hero can use it
  startDate?: Date;               // When the magic activates
  expiresAt?: Date;               // When the magic fades
  campaignId?: string;            // The grand war it belongs to (Platform)
  businessId?: string;            // The merchant who forged it (Business)
  brandingBusinessId?: string;    // If a merchant wishes to slap their banner on a platform event
}
```

### 🖋️ Forging Request (Sample)
```json
{
  "title": "Hyperlocal Winter Blast",
  "code": "WINTERBLAST20",
  "sourceType": "platform",
  "discountValue": 20,
  "discountType": "percentage",
  "usageLimit": 1000,
  "perUserLimit": 1,
  "campaignId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### ✨ The Forged Artifact (Response Data)
```json
{
  "id": "e8a9b2b3-1f1c-4b31-bf8a-6b5d9b7f5cf4",
  "title": "Hyperlocal Winter Blast",
  "code": "WINTERBLAST20",
  "sourceType": "platform",
  "discountValue": "20.00",
  "discountType": "percentage",
  "usageLimit": 1000,
  "perUserLimit": 1,
  "status": "draft",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "campaign": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "active"
  }
}
```

---

## 📖 Chapter 2: Gazing into the Vault (List Coupons)

**The Scene:** As the marketplace bustles, wanderers and merchants alike wish to gaze upon the active campaigns and available discounts. They visit the Grand Noticeboard.

**The Endpoint:** `GET /api/v1/coupons/list`

**Description:** A public lens into the vault of discounts. It allows pagination so the users are not overwhelmed by the massive history of past, present, and scheduled coupons.

### 📜 The Ledger Request (Query Parameters `PaginationQueryDto`)
```typescript
interface PaginationQueryDto {
  page?: number;   // The page of the ledger (default: 1)
  limit?: number;  // Entries per page (default: 10)
}
// Example: GET /api/v1/coupons/list?page=1&limit=20
```

### ✨ The Ledger Returns (Response Data)
```json
{
  "data": [
    {
      "id": "e8a9b2b3-1f1c-4b31-bf8a-6b5d9b7f5cf4",
      "code": "WINTERBLAST20",
      "status": "active",
      "discountValue": "20.00"
    }
  ],
  "meta": {
    "itemCount": 1,
    "totalItems": 150,
    "itemsPerPage": 20,
    "totalPages": 8,
    "currentPage": 1
  }
}
```

---

## 📖 Chapter 3: The Shopper's Digital Wallet (Save & Track)

**The Scene:** Alex the Shopper spots `WINTERBLAST20` on the platform banner. "I don't want to forget this," Alex thinks. With a single click, Alex stores the free coupon safely into their digital wallet. 

**The Endpoints:**
- **Save a Coupon:** `POST /api/v1/coupons/save`
- **Remove a Saved Coupon:** `POST /api/v1/coupons/remove-saved`
- **View Saved Coupons:** `GET /api/v1/coupons/saved`

**Description:** This allows consumers to feel secure. They don't have to "pay" for coupons up front. They simply discover them and bookmark them into their account for easy access when it's time to visit the checkout.

### 📜 The Stash Request (Payload Interface)
```typescript
interface SaveRequest {
  code: string; // The promotional code to stash or remove
}
```

### 🖋️ Stash Request (Sample)
```json
{
  "code": "WINTERBLAST20"
}
```

### ✨ The Stash Revealed (GET `/api/v1/coupons/saved` Sample Response)
```json
[
  {
    "id": "123e4567-e89b-12d3...",
    "savedAt": "2026-02-20T20:30:00.000Z",
    "coupon": {
      "id": "e8a9b2b3-1f1c-4b31-bf8a-6b5d9b7f5cf4",
      "code": "WINTERBLAST20",
      "discountValue": "20.00",
      "status": "active"
    }
  }
]
```

---

## 📖 Chapter 4: The Trial of the Validation Engine (Checkout)

**The Scene:** Alex finally approaches the checkout gates, confidently pulling `WINTERBLAST20` from their digital wallet. But the gates do not open so easily. The formidable Validation Engine steps forward! It aggressively cross-references Alex's physical location (for hyperlocal campaigns), checks if the Campaign is still breathing, and scours the Redemption Logs to see if Alex is trying to double-dip. No stacking is permitted on its watch!

**The Endpoint:** `POST /api/v1/coupons/validate`

**Description:** The ultimate enforcer of the PRD. It actively rejects coupons that are Draft, Archived, or Expired. It blocks stacking. It cross-references Hyperlocal Postal Codes. If a merchant issued it, it re-verifies that the merchant hasn't lost their elite Tier capabilities. Only the worthy pass to checkout.

### 📜 The Challenge (Payload Interface)
```typescript
interface ValidateRequest {
  code: string; // The coupon code presented at the checkout gate
}
```

### 🖋️ Challenge Request (Sample)
```json
{
  "code": "WINTERBLAST20"
}
```

### ✨ The Engine's Verdict (Response Data)
If Alex attempts to use an expired coupon, the gate slams shut with a stern error:
```json
{
  "statusCode": 400,
  "message": "Campaign has ended.",
  "error": "Bad Request"
}
```

But if Alex is pure of heart and perfectly aligns with the rules, the gates glow green, returning the full coupon data to apply to the cart order total:

```json
{
  "id": "e8a9b2b3-1f1c-4b31-bf8a-6b5d9b7f5cf4",
  "code": "WINTERBLAST20",
  "sourceType": "platform",
  "discountType": "percentage",
  "discountValue": "20.00",
  "status": "active",
  "campaign": {
    "id": "f47ac10b",
    "name": "Winter Sale",
    "type": "hyperlocal",
    "targetPostalCodes": ["10001", "10002"]
  },
  "business": null
}
```

---

## 📖 Chapter 5: The Merchant's Ledger (Business Analytics)

**The Scene:** After the grand Winter Sale, the Platinum Merchant sits in their study, eager to see how the local patrons engaged with their exclusive coupons. They open the sealed analytics ledgers to track the performance of their campaigns.

**The Endpoints:**
- **At-a-glance Stats:** `GET /api/v1/business/coupons/stats`
- **Trend Charts:** `GET /api/v1/business/coupons/chart-data`
- **History Logs:** `GET /api/v1/business/coupons/sales-and-redemptions`

**Description:** Built exclusively for owners, these endpoints provide the mandatory PRD Analytics layers (Redemption Rates, Business Participation, Performance). They offer a complete dashboard overview of how freely-distributed business coupons are performing in the wild against the real redemptions that hit their bottom line.

### ✨ The Ledger Revealed (GET `/stats` Sample Response)
```json
{
  "totalSold": 0,
  "totalRedeemed": 45,
  "outstandingLiability": 0,
  "activeCoupons": 2
}
```

---

**And so, the Marketplace thrives, kept safe and fair by the watchful constraints of the Coupon Engine!**
