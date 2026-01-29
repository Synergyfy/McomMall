# MCOM Terminal Cashback System – Product Requirements Document (PRD)

## 1. Overview

This document defines the full structure, logic, and implementation requirements for the MCOM Terminal Cashback System.

The system is designed to work in environments where:
- Cash payments are used
- POS/terminal systems cannot be integrated
- Transaction values cannot be automatically retrieved

The system operates independently as a terminal cashback solution and is **not campaign-based**.

---

## 2. Objectives

- Enable businesses to offer cashback without POS integration
- Prevent fraud and abuse
- Give businesses approval control
- Support cash, card, and transfer payments
- Allow scalable national deployment
- Provide simple user and merchant experience

---

## 3. Core Architecture: Three-Level Cashback Model

The Terminal Cashback System operates using three configurable levels.

Each business is assigned one level based on risk, size, and trust profile.

These three levels are selectable from the Admin Terminal Cashback Setup Page.

---

### Level 1: Verified Cashback (Default System)

This is the main and recommended system.

#### Requirements
- QR Code or Claim Link
- Receipt / Proof Upload
- Spend Range Selection
- Business Approval
- Admin Oversight

#### Flow
1. Customer pays (cash/card/transfer)
2. Customer scans QR or clicks link
3. Customer uploads receipt
4. Customer selects spend range
5. Claim is submitted
6. Status = Pending Approval
7. Business reviews and approves
8. Cashback credited to wallet

#### Use Case
- Most retail businesses
- Restaurants
- Stores
- Service providers
- Medium and large merchants

---

### Level 2: Fixed Visit Reward System

This system does not depend on transaction amount.

#### Requirements
- QR Code or Claim Link
- Optional Proof
- Fixed Reward Value
- Business Approval

#### Flow
1. Customer pays
2. Customer scans QR / clicks link
3. Claim submitted
4. Business approves
5. Fixed cashback credited

#### Example
Buy anything → Get £1 back

#### Use Case
- Cafes
- Barbers
- Salons
- Small vendors
- High-frequency services

---

### Level 3: POS / Enterprise Integration (Future)

This level supports businesses with compatible systems.

#### Requirements
- API integration (future)
- Transaction reference capture
- Automated verification
- Optional approval

#### Flow
1. POS sends transaction data
2. System verifies amount
3. Cashback calculated
4. Approval (optional)
5. Wallet credited

#### Use Case
- Enterprise partners
- Franchises
- Large chains

---

## 4. Terminal Cashback Setup Page (Admin)

Each business has a dedicated setup page in:
- MCOM Rewards Admin
- MCOM Mall Admin

(Exact location to be finalized later.)

### Setup Options

Business selects:
- Cashback Level (1, 2, or 3)
- QR Code / Link option
- Approval rules
- Limits
- Ranges (if applicable)

---

## 5. QR Code and Claim Link System

Each business receives:
- Unique QR Code
- Unique Claim URL (Link)

### Purpose

- QR for physical locations
- Link for POS receipts / terminals

### Use Case

If terminal cannot display QR image:
→ Business embeds the link in receipt or screen text

Example:
"Claim your cashback at: mcom.app/claim/ABC123"

---

## 6. Spend Range System (Level 1)

Ranges are configurable per business.

Example:

- £1 – £5 → £0.50
- £6 – £15 → £1.50
- £16 – £30 → £3.00
- £30+ → £5.00

Rules:
- Ranges must match receipt
- One range per claim
- Ranges can be disabled/enabled

---

## 7. Proof Upload System

Customers must upload:
- Photo of receipt
- Invoice
- Handwritten receipt
- Payment confirmation

System stores:
- Image
- Time
- GPS
- Device ID

---

## 8. Business Approval System

All cashback claims require business confirmation before crediting.

### Approval Workflow

1. Claim submitted
2. Status = Pending
3. Business notified
4. Business reviews claim
5. Approve or Reject

---

### Business Dashboard Features

Business can:
- View pending claims
- View proof
- Approve / Reject
- Add rejection reason
- See history

---

## 9. Auto-Approval Escalation System

To prevent businesses from blocking rewards:

System enforces timed auto-approval.

### Configurable Rules (Admin)

Admin can set default and per-business rules:

- 24 hours
- 48 hours
- 7 days
- 30 days

If no action within time:
→ System auto-approves

---

### Notification System

Before auto-approval:

Business receives:
- In-app alerts
- Email
- SMS (optional)
- Push notifications

Escalation schedule configurable.

---

## 10. Fraud Prevention System

Mandatory controls:

- One receipt = One claim
- Duplicate detection
- QR rotation
- Location verification
- Time window enforcement
- Device fingerprinting
- Blacklist management

---

## 11. Limits and Controls

Each business can configure:

- Max cashback per day
- Max per customer
- Max per receipt
- Max monthly budget
- Max claims per user

System auto-enforces limits.

---

## 12. Customer Claim Flow (All Levels)

1. Customer pays
2. Customer opens claim page
3. Scans QR or clicks link
4. Uploads proof (if required)
5. Submits claim
6. Sees status: Pending
7. Receives approval notification
8. Wallet credited

---

## 13. Admin Management Panel

Admin can:

- Override approvals
- Suspend businesses
- Modify rules
- Change time limits
- Review fraud reports
- Audit transactions
- Generate reports

---

## 14. Reporting & Analytics

System provides:

- Total cashback issued
- Approval time averages
- Rejection rates
- Fraud attempts
- Business performance
- Customer usage

---

## 15. System Configuration Hierarchy

Rules priority:

1. Platform Default
2. Admin Override
3. Business Settings

Higher level overrides lower.

---

## 16. Data Storage Requirements

Each claim stores:

- Claim ID
- User ID
- Business ID
- Amount range
- Reward value
- Proof file
- Status
- Timestamps
- Location
- Device info

---

## 17. Security & Compliance

- Encrypted uploads
- Secure APIs
- Role-based access
- Audit logs
- GDPR compliance
- Data retention rules

---

## 18. Future Enhancements

- Full POS integration
- AI receipt verification
- Dynamic rewards
- Smart fraud scoring
- Automated trust levels
- Loyalty tiers

---

## 19. Implementation Priority

Phase 1:
- Level 1 System
- Approval workflow
- QR/Link
- Admin rules

Phase 2:
- Level 2 rollout
- Advanced reporting

Phase 3:
- Level 3 integrations

---

## 20. Summary

The MCOM Terminal Cashback System is built as a three-level, approval-driven, fraud-controlled platform that operates without POS dependency.

It uses QR/Link access, proof submission, business verification, and automatic enforcement to ensure trust, scalability, and sustainability.

