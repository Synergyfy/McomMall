# The Money Engine: A Story of Value
### Understanding the Voucher & Coupon Ecosystem

## Prologue: The Three Players
To understand the Money Engine, let's follow three characters:
1.  **Alice (The Admin):** She runs the platform and controls the "Laws of Physics" for money.
2.  **Bob (The Business Owner):** He owns "Bob's Burgers" and wants more customers.
3.  **Charlie (The Customer):** He wants to eat burgers and save money.

---

## Chapter 1: The Printing Press (Admin Setup)
**The Goal:** Alice wants to create a special currency called the "Lunch Voucher" that incentivizes people to eat out.

**The Action:** Alice uses the **Reward Definition** endpoint. She decides that for every £10 a customer puts in, the system will add £2.
*   **Split Ratio:** She sets a "Real Ratio" of 0.83 (approx).
    *   *Math:* If Charlie pays £10, the total value becomes £12. (£10 / 12 = 0.83).
*   **Scope:** She decides this voucher works at **Any Shop** (or she could limit it to just Restaurants).

**API Call (Alice Creates the Voucher Type):**
`POST /api/v1/money-engine/definitions`
```json
{
  "name": "Lunch Voucher",
  "description": "Get 20% extra value on all food orders!",
  "splitRatio": { "real": 0.8333 }, // Customer pays ~83% of the total value
  "scopeType": "ANY_SHOP",
  "isActive": true
}
```

---

## Chapter 2: The Investment (Customer Purchase)
**The Goal:** Charlie sees the "Lunch Voucher" offer. He thinks, "I pay £10, I get £12 to spend? Deal."

**The Action:** Charlie buys the voucher using his credit card (Stripe/PayPal).
1.  The Money Engine verifies his £10 payment.
2.  It mints a **User Voucher** with a unique code (e.g., `LUNCH123`).
3.  **The Magic:** The voucher has two pockets:
    *   **Real Pocket:** £10 (Charlie's cash)
    *   **Reward Pocket:** £2 (System bonus)

**API Call (Charlie Buys the Voucher):**
`POST /api/v1/money-engine/vouchers/purchase`
```json
{
  "rewardDefinitionId": "def-uuid-lunch",
  "paymentAmount": 10.00,
  "transactionId": "stripe_pi_123456",
  "paymentGateway": "stripe"
}
```

**Response:**
```json
{
  "code": "LUNCH123",
  "realBalance": 10.00,
  "rewardBalance": 2.00,
  "state": "ACTIVE"
}
```

---

## Chapter 3: The Transaction (Spending)
**The Goal:** Charlie goes to "Bob's Burgers". His bill is £6.

**The Action:** Charlie scans his voucher at Bob's till.
The System acts as the banker. It must decide whose money to burn first: Charlie's cash or the System's bonus?
*   *Strategy:* Alice set the rule to `reward_first`.
*   **Result:**
    *   Bill: £6
    *   Reward Pocket: £2 (Burned completely -> £0 left)
    *   Real Pocket: £4 (Burned £4 -> £6 left)
*   **Charlie's Voucher Now:** Total £6 (£6 Real + £0 Reward).

**API Call (Bob's POS charges the Voucher):**
`POST /api/v1/money-engine/vouchers/spend`
```json
{
  "userVoucherId": "voucher-uuid-charlie",
  "shopId": "shop-uuid-bob",
  "amount": 6.00
}
```

---

## Chapter 4: The Cashback Loop (Business Injection)
**The Goal:** Bob is happy Charlie came in. He wants to ensure Charlie comes back next week.

**The Action:** Bob's POS automatically triggers a "Cashback Injection" into Charlie's voucher.
"Thanks for dining, Charlie! I've added £1 to your voucher for next time."

**The Result:**
*   Charlie's Voucher (Before): £6 Real + £0 Reward.
*   Charlie's Voucher (After): £6 Real + **£1 Reward**.
*   Total Value: £7.

**API Call (Bob gives cashback):**
`POST /api/v1/money-engine/vouchers/cashback`
```json
{
  "userVoucherId": "voucher-uuid-charlie",
  "shopId": "shop-uuid-bob",
  "amount": 1.00
}
```

---

## Chapter 5: The Analytics (Measuring Success)
**The Admin (Alice):** Checks `GET /money-engine/admin/analytics` to see how much "Real Money" vs "Reward Money" is circulating.
**The Owner (Bob):** Checks `GET /money-engine/business/stats` to see "Total Spent in Shop" (how much he made) and "Cashback Given" (marketing cost).
**The Customer (Charlie):** Checks his app `GET /money-engine/customer/stats` to feel good about the £3 free money he earned (£2 sign-up + £1 cashback).

---

## Summary of Flows

| Actor | Action | Endpoint | Why? |
| :--- | :--- | :--- | :--- |
| **Admin** | Create Definition | `POST /definitions` | Define the rules of value (Split Ratio, Scope). |
| **Customer** | Purchase Voucher | `POST /vouchers/purchase` | Exchange Real Money for Voucher (Real + Reward). |
| **POS/Biz** | Spend | `POST /vouchers/spend` | Deduct balance to pay for goods. |
| **POS/Biz** | Inject Cashback | `POST /vouchers/cashback` | Add Reward Balance to encourage return visits. |
| **Customer** | Transfer | `POST /vouchers/transfer` | Send value to a friend (Splits move proportionally). |
