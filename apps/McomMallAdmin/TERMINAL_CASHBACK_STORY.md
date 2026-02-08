# MCOM Terminal Cashback System - Character Role Story

## Characters
*   **Alice (The Super Admin):** The platform governor. She sets global policies, manages fraud prevention, and ensures businesses are responsive to customer claims.
*   **Bob (The Business Owner - "Urban Eats"):** A merchant who uses the system to reward cash-paying customers. He configures his reward levels and approves incoming claims.
*   **Charlie (The Customer):** A loyalty-seeking user who pays in cash and claims cashback by scanning QR codes and uploading receipts.

## The Workflow

### 1. Global Governance (Alice)
Alice navigates to the **Terminal Cashback Control** in the Admin Dashboard. She defines the "Platform Defaults":
*   **Default Level:** Level 1 (Verified).
*   **Auto-Approval Timer:** 48 hours (if a business doesn't respond, the system approves).
*   **Fraud Sensitivity:** High (GPS and Device ID matching enabled).

### 2. Business Onboarding (Bob & Alice)
Alice approves Bob's restaurant, "Urban Eats," for Terminal Cashback. 
Bob then logs into his dashboard to configure his specific rules:
*   **Reward Model:** Level 1.
*   **Spend Ranges:** 
    *   £10 - £20 → £1.00 Reward
    *   £20 - £50 → £2.50 Reward
    *   £50+ → £5.00 Reward
*   **Asset Generation:** Bob downloads his unique **Merchant QR Code** and prints it for his checkout counter.

### 3. The Physical Transaction (Charlie & Bob)
Charlie visits Urban Eats and buys a pizza for £15.00 in cash. Bob hands him a standard paper receipt.

### 4. The Digital Claim (Charlie)
Charlie scans the QR code at the counter. His phone opens the **MCOM Claim Portal**:
1.  He snaps a photo of the receipt.
2.  He selects the **£10 - £20** spend range.
3.  He hits **Submit**.
*System Check:* The system records Charlie's GPS location to ensure he is actually at Urban Eats and fingerprints his device to prevent duplicate claims.

### 5. Merchant Approval (Bob)
Bob receives a push notification: "New Cashback Claim - £1.00".
He opens his **Claims Queue**, sees Charlie's receipt photo, confirms it's valid, and clicks **Approve**.

### 6. Reward Cashback (The System)
The Money Engine awards £1.00 cashback and deposits it into Charlie's **MCOM Wallet**. Charlie receives a "Cashback Successful" notification.

### 7. Escalation & Audit (Alice)
If Bob had ignored the claim for 48 hours, Alice's **Escalation Logic** would have auto-approved it. 
Alice later reviews the **Analytics Dashboard**, seeing that Terminal Cashback has increased Bob's "Cash-to-Digital" conversion rate by 15%. She also reviews a fraud report where a user tried to upload the same receipt twice; the system caught the duplicate and Alice issues a warning to that user.
