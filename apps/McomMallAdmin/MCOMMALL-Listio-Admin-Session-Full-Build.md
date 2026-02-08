# MCOMMALL \(Listio\) — Admin Session Full Build

## 1\) Quick summary — what the Admin does

The Admin runs the whole site\. From this screen the Admin can:

- Create and change Sectors, Categories and Subcategories \(what businesses choose when they sign up\)\.
- Create and manage Coupons, Gift Cards, Vouchers, and promotions\.
- Approve or remove listings and products\.
- Manage users and business accounts \(suspend, ban, verify, help\)\.
- Monitor payments, refunds and payouts\.
- Handle disputes, complaints, and policy breaks\.
- Run marketing \(featured listings, emails, homepage banners\)\.
- See site analytics and daily health checks\.
- Control what appears in Business and Customer dashboards, the Marketplace and Homepage\.

All actions should be possible from the Admin panel and reflected anywhere on the site immediately \(or after an admin publish button when needed\)\.

## 2\) Admin roles &amp; permissions \(who can do what\)

**Why:** not every admin should have full power\. Create roles\.

**Roles \(examples\):**

- Super Admin — full power\. Can change roles, delete data, access finance\.
- Admin — manage content, listings, users, and marketing\.
- Moderator — review listings, messages, comments, and run manual verifications\.
- Finance Manager — view transactions, run refunds, manage payouts \(no user deletion\)\.
- Support Agent — handle tickets and user help \(no content deletion\)\.
- Marketing Manager — create campaigns, banners, coupons, featured slots\.

**Permissions list:**

- Users: view, edit, suspend, ban, delete, verify\.
- Listings: view, edit, approve, remove, pin \(feature\), mark as verified\.
- Payments: view transactions, refund, export, retry payouts\.
- Content: edit site pages, homepage banners, FAQs, terms\.
- Marketing: create campaigns, coupons, vouchers, gift\-cards, newsletters\.
- Reports: view analytics, export CSVs\.
- Settings: platform\-wide settings \(fees, currencies, tax rates\)\.

## 3\) Admin main navigation \(Admin panel top\-level pages\)

- Dashboard \(summary and alerts\)
- Users \(search, view, manage\)
- Businesses \(business accounts and listings\)
- Listings \(all listings — edit&#x2F;approve&#x2F;remove\)
- Products \(product catalog management\)
- Services \(service catalog management\)
- Orders &amp; Transactions \(payments, refunds, payouts\)
- Verifications \(identity &amp; listing checks\)
- Disputes &amp; Complaints \(tickets &amp; resolution\)
- Marketing \(Coupons, Gift Cards, Vouchers, Campaigns, Featured\)
- Content \(Homepage, CMS pages, Banners, FAQs\)
- Analytics \(traffic, conversions, finance KPIs\)
- Support \(ticket system\)
- Settings \(platform rules, fees, email templates\)
- Audit Log \(who did what\)
- Integrations \(webhooks, payment providers\)

## 4\) Admin Dashboard \(what the admin sees first\)

**Top of page:**

- Live counts and quick links: New listings pending, New user signups \(24h\), Open tickets, Transactions today, Refunds pending, Revenue today\.
- Big alert bar: urgent items \(e\.g\., &quot;High fraud risk: 3 payments flagged&quot;\)\.

**Widgets:**

- Recent activity stream \(who did what — new listings, edited products, refunds\)\.
- Quick action buttons: Approve pending listings, Create coupon, Refund payment, Create banner\.
- Site health indicators \(uptime, errors, slow pages\)\.
- Mini analytics: visits, signups, revenue \(last 7 days\)\.

**Why:** Admin can jump to issues or run quick tasks\.

## 5\) Create Sectors, Categories and Subcategories \(step\-by\-step\)

**Goal:** Admin must build the taxonomy the Business Owner will choose from when creating an account or listing\.

**Where:** Admin &gt; Content &gt; Sectors &amp; Categories

**Step\-by\-step UI and fields:**

1. **Create Sector** \(main group\)
    - Name \(e\.g\., Food &amp; Beverage\)
    - Short description \(one line\)
    - Long description \(optional\)
    - Icon or image \(upload\)
    - Default settings: visibility \(public&#x2F;private\), order \(position on menu\)
    - Tags \(optional quick filters\)
    - Save &#x2F; Publish toggle
2. **Within a Sector: Create Category**
    - Name \(e\.g\., Restaurants\)
    - Short description
    - Parent Sector \(preselected\)
    - Representative image \(optional\)
    - Show in sign\-up: toggle \(should appear for Business Owner to choose\)
    - Allowed listing types: product, service, booking \(checkboxes\)
    - Custom fields: Admin can add fields that show when a business selects this category \(example fields listed below\)
    - Save &#x2F; Publish
3. **Within a Category: Create Subcategory**
    - Name \(e\.g\., Italian Restaurants\)
    - Description
    - Parent Category \(preselected\)
    - Default filters \(price\-range, cuisine tag\)
    - Save &#x2F; Publish

**Custom fields for Category&#x2F;Subcategory:**

- Text fields \(e\.g\., License number\)
- Dropdowns \(e\.g\., Seating type: indoor&#x2F;outdoor\)
- Yes&#x2F;No \(e\.g\., Offers home delivery\)
- Numeric \(e\.g\., Seating capacity\)

**How it shows to Business Owner:**

- When signing up or creating a listing, the business will pick Sector → Category → Subcategory\. The platform will display the custom fields relevant to that choice\.

**Extra admin features:**

- Bulk import&#x2F;export of sectors and categories via CSV\.
- Reorder categories with drag\-and\-drop\.
- Merge or split categories \(admin chooses which items move where\)\.

## 6\) Coupons, Gift Cards, Vouchers, and Promotions \(step\-by\-step\)

**Where:** Admin &gt; Marketing &gt; Coupons &amp; Giftcards

**Common fields for all promotions:**

- Title \(admin\-facing name\)
- Public name \(customer\-facing\)
- Code \(auto\-generate or custom\)
- Description \(customer\-facing\)
- Type \(percentage off, fixed amount, free shipping, buy\-one\-get\-one\)
- Applies to: all listings, specific listings, categories, businesses, or customers
- Start date &#x2F; end date
- Max uses \(overall\) and per\-user limit
- Min purchase amount
- Usage rules \(stackable with others? one\-time use?\)
- Status: Draft &#x2F; Active &#x2F; Paused &#x2F; Expired
- Visibility: show on homepage &#x2F; marketplace &#x2F; business dashboards
- Image for promotion

**Specific: Gift Card**

- Fixed denominations \(list\) or variable amount
- Expiry policy \(how long before it expires\)
- Code or digital card ID
- Claim flow: Admin can create cards for sale or free distribution
- Redemption rules \(which products&#x2F;categories accept it\)

**Specific: Voucher**

- Voucher ID, allocation to customer or business
- Can be claimable \(button\) or sent by admin

**Create flow:**

1. Admin selects Create → Choose promotion type\.
2. Fill the fields above\.
3. Preview how it will appear to customers and businesses\.
4. Choose where it shows \(homepage banner, business dashboard, marketplace, email only\)\.
5. Save &amp; Publish\.

**Where it reflects:**

- If Admin marks &quot;Show on homepage&quot;, the promotion appears on homepage banner area\.
- If set to &quot;Show in Business Dashboard&quot;, businesses will see a call\-to\-action to claim or apply the coupon in their marketing area\.
- If set to &quot;Show in Customer Dashboard&quot;, customers see it under My Coupons &#x2F; Promotions\.

**Extra features:**

- Bulk generate codes\.
- Export redemption report \(who used them, how much saved\)\.
- Set auto\-expiry and automated reminders to customers about unused vouchers\.

## 7\) Content and CMS controls \(Homepage, Banners, Pages\)

**Where:** Admin &gt; Content &gt; Pages &#x2F; Homepage Builder

**What Admin can do:**

- Edit static pages \(About, Terms, Privacy, Help\)\.
- Build homepage sections: hero banner, featured categories, promotional strip, featured listings carousel, blog feed\.
- Place a CTA button that links to any part of the platform \(e\.g\., Claim Gift Card\)\.
- Schedule banners \(display from date A to date B\)\.
- A&#x2F;B test banners \(optionally: Banner A vs Banner B and track CTR\)\.

**Fields for banners:**

- Title, short copy, link, image, start&#x2F;end date, show on mobile&#x2F;desktop, priority order\.

**How it shows:**

- When a banner is published, it instantly appears on public homepage unless scheduled\.
- Admin can choose to display banners only to logged\-in businesses or customers\.

## 8\) User &amp; Business account management \(step\-by\-step\)

**Where:** Admin &gt; Users and Admin &gt; Businesses

**User record fields:**

- Name, email, phone
- Account type \(Customer &#x2F; Business &#x2F; Admin\)
- Signup date, last login
- Status \(Active &#x2F; Suspended &#x2F; Banned &#x2F; Pending verification\)
- Wallet balance
- Linked listings and orders
- Verification documents \(IDs, business licenses\)
- Notes &amp; internal tags \(admin can add comments for other admins\)

**Actions admin can take on a user:**

- View full profile and activity log\.
- Send message or email to user\.
- Manually verify identity or business documents\.
- Suspend account temporarily \(with reason and duration\)\.
- Permanently ban account\.
- Reset password \(send reset link\)\.
- Adjust wallet balance \(credit&#x2F;debit\) with reason\.
- Merge duplicate accounts\.

**Business record fields:**

- Business name, owner, industry \(Sector&#x2F;Category&#x2F;Subcategory\), address, phone\.
- Listing IDs, products, services, staff members\.
- Bank&#x2F;payment details masked \(for security\)\.
- Rating and reviews summary\.
- Status \(Active &#x2F; Pending &#x2F; Suspended\)
- Documents \(business license, tax ID\)

**Actions admin can take on a business:**

- Approve or reject business verification\.
- Edit business listing \(title, description, images\)\.
- Remove specific listings or the whole business from marketplace\.
- Set featured badge \(e\.g\., Verified Partner\)\.
- Force payouts or pause payouts\.
- Assign partnerships and plaque&#x2F;QR assignments \(see Partnerships section\)\.

## 9\) Listing, Product and Service management \(step\-by\-step\)

**Where:** Admin &gt; Listings &#x2F; Products &#x2F; Services

**Listing record should include:**

- Title, description, owner business, sector&#x2F;category&#x2F;subcategory, location, hours\.
- Media gallery \(photos, video\), attachments \(menus, PDF\)
- Price or pricing model \(fixed, per hour, per person\)
- Booking settings \(if applicable\): availability calendar, cancellation rules\.
- Tags, attributes \(e\.g\., wheelchair access, delivery\)
- Reviews &amp; ratings
- Verification status

**Actions for each listing:**

- Approve \(make public\) or set to draft\.
- Edit content \(title, description, photos\)\.
- Pin to top \(featured\) or remove from results\.
- Change category or replace owner \(transfer listing\)\.
- Add admin\-only notes \(internal comment feature visible to other admins\)\.
- Block or remove listing permanently\.

**Bulk actions:**

- Approve multiple listings at once\.
- Export listing data\.

**Listing moderation workflow example:**

1. New listing created by business → goes into Pending queue\.
2. Moderator reviews images &amp; description\. If okay, Approve → listing goes live\.
3. If issue, Reject with a reason \(automated email to business with steps to fix\)\.
4. If urgent policy break, Suspend immediately and open a ticket for manual review\.

## 10\) Verifications \(identity, business, listing\)

**Where:** Admin &gt; Verifications

**Types of verification:**

- Identity \(ID document, selfie checks\)
- Business verification \(business license, tax docs\)
- Listing verification \(proof that listing is real — e\.g\., owner uploaded PDF or photo of location\)

**Fields and actions:**

- View uploaded documents with timestamp\.
- Approve or Reject with a reason \(reason is sent to user&#x2F;business\)\.
- Request more documents \(system sends a secure upload link\)\.
- Mark as &quot;Verified&quot; badge \(display on the listing&#x2F;business profile\)\.

**Audit trail:**

- Every verification decision stores who did it and when\.

## 11\) Payments, Transactions, Refunds and Payouts

**Where:** Admin &gt; Finances &gt; Transactions

**Transaction record includes:**

- Transaction ID, date, amount, fees, payer, payee, payment method, status \(completed&#x2F;pending&#x2F;failed\)
- Linked order or listing

**Actions Admin can take:**

- View detailed transaction history\.
- Issue refunds \(partial or full\) with reason\.
- Flag suspicious transactions for review\.
- Re\-run failed payouts\.
- Export finance reports \(CSV, Excel\) for a date range\.

**Payout controls for businesses:**

- Pause payouts to a business \(temporary hold\)\.
- Force payout \(manual release\) if approval is needed\.
- Set payout schedule defaults \(daily, weekly, monthly\) at platform level\.

**Security:**

- Mask full card or bank details in UI\.
- Two\-step confirmation \(Finance Manager \+ Super Admin\) for refunds above a threshold\.

## 12\) Disputes &amp; Complaint handling

**Where:** Admin &gt; Disputes &amp; Complaints \(also accessible via Support\)

**Dispute record should include:**

- Dispute ID, linked order&#x2F;listing, customer, business, claim text, evidence attachments
- Status: New &#x2F; Under Review &#x2F; Mediated &#x2F; Resolved &#x2F; Escalated
- Timeline of messages and admin notes

**Resolution workflow:**

1. Customer opens a dispute → auto\-creates a ticket and locks the linked order \(no payouts\)\.
2. Admin assigns dispute to Support Agent\.
3. Support requests evidence from both sides \(deadline for each side\)\.
4. Admin reviews evidence, consults Finance if refund needed\.
5. Admin resolves: refund, partial refund, or reject claim\. Decision is recorded and message sent to both parties\.
6. If user appeals, escalate to Super Admin\.

**Auto\-actions:**

- If no response from business after N days, escalate and warn business account\.

## 13\) Support ticketing system

**Where:** Admin &gt; Support

**Ticket fields:**

- Ticket ID, type \(complaint, question, verification help\), priority, status, assigned agent, related user&#x2F;order
- Messages stream \(customer, business, admin replies\)
- Internal notes \(private to admins\)

**Features:**

- Assign tickets to agents\.
- SLA timers \(e\.g\., respond within 24 hours\)\.
- Templates for replies \(refund asked, verification needed\)\.
- Auto\-assignment rules \(e\.g\., high priority disputes go to senior agents\)\.

## 14\) Analytics and reports \(what to show\)

**Where:** Admin &gt; Analytics

**High\-level metrics \(dashboard\):**

- Visitors, new signups, active users \(last 7&#x2F;30&#x2F;90 days\)
- New listings created and approved
- Transactions \(volume and value\) — daily&#x2F;weekly&#x2F;monthly
- Refunds and disputes \(counts and amounts\)
- Top categories and top businesses by revenue
- Conversion funnel \(visits → listing views → bookings&#x2F;orders\)
- Coupon redemptions and campaign ROI
- Email campaign open&#x2F;click rates

**Exportable reports:**

- CSV &#x2F; Excel for finance, users, listings, promotions
- Scheduled reports via email \(daily&#x2F;weekly&#x2F;monthly\)

**Alerts:**

- If fraud rate &gt; threshold, show an alert\.
- If server errors spike, show technical alert and link to logs\.

## 15\) Marketing &amp; Featured Listings

**Where:** Admin &gt; Marketing

**Features:**

- Create Featured Slots: Admin can create paid or free featured slots on homepage or category pages\. Fields: slot name, price, duration, target area\.
- Promote a listing: choose listing → pick slot → set dates → publish\.
- Newsletter creation: email editor, audience selection \(all users, businesses, or custom segment\), schedule send\.
- Automated campaigns: e\.g\., &quot;Send coupon to users who haven&#39;t purchased in 30 days\.&quot;

**Tracking:**

- Show CTR, redemptions, uplift in bookings for each campaign\.

## 16\) Partnerships, Groups &amp; Plaques \(QR Plaque distribution\)

**Where:** Admin &gt; Partnerships

**Admin actions:**

- Create a Partnership record \(name, partner details, start&#x2F;end date, benefits\)\.
- Assign plaque or QR code to partners: Admin generates QR plaque, records partner details \(address, contact, assigned promos\), and marks status \(distributed, active, archived\)\.
- Map plaque to business pages so customers can scan and claim promotions\.
- Track plaque scanning analytics\.

**Fields for partner record:**

- Partner name, contact person, phone&#x2F;email, assigned plaques IDs, assigned promotions, limits \(e\.g\., max redemptions\), notes\.

## 17\) Loyalty &amp; Reward controls \(Admin\-managed\)

**Where:** Admin &gt; Loyalty &amp; Reward

**Features:**

- Create points program: points per purchase, expiry, tiers\.
- Create reward items businesses or customers can claim\.
- See redemption logs and manage fraudulent redemptions\.
- Sync loyalty rewards to business dashboards \(businesses can see how many redemptions occurred in their store\)\.

## 18\) Security, audit logs &amp; compliance

**Where:** Admin &gt; Audit &#x2F; Security

**What to store:**

- All admin actions: who changed what and when\.
- User login attempts and suspicious IP alerts\.
- Document uploads \(with timestamp\) retained for compliance\.

**Admin features:**

- Force password reset for users\.
- Two\-factor enforcement for sensitive roles\.
- Export audit logs for legal requests\.

## 19\) Settings &amp; platform rules

**Where:** Admin &gt; Settings

**Examples of settings:**

- Default fees and commission split\.
- Currency and tax settings\.
- Default payout schedule\.
- Email templates \(welcome, verification, refund notice\)\.
- Moderation rules \(blocked words list, image guidelines\)\.
- Thresholds for two\-step approvals \(refunds &gt; X need 2 approvals\)\.

## 20\) Notifications and automated emails

**Where:** Admin &gt; Notifications

**What Admin controls:**

- Email templates and copy for important events: account verification, listing rejected, refund initiated, coupon claimed\.
- Where notifications show: in\-app, email, or both\.
- Which admin roles receive alerts for certain events \(e\.g\., Finance Manager receives refund alerts\)\.

**Example automated flows:**

- New high\-value transaction → send alert to Finance Manager\.
- Listing rejected → email sent to business with reason and link to correct\.
- Coupon expiring in 48 hours → reminder email to users who haven&#39;t used it\.

## 21\) How admin changes should reflect across the site \(mapping\)

**Rule:** When Admin creates or updates anything, they choose where it shows\. Each object has visibility flags\.

**Where to reflect:**

- Homepage \(banners, featured listings, promotions\)
- Marketplace listing pages \(featured tag, featured carousel\)
- Business Dashboard \(promotions, coupons, claimed gift cards\)
- Customer Dashboard \(My Coupons, My Vouchers, Gift Card balance\)
- Search filters \(new categories or tags appear immediately\)

**Examples:**

- Admin creates a coupon and checks &quot;Show in Business Dashboard&quot; → businesses see it under their Marketing area and can claim it\.
- Admin creates a featured listing and assigns it to homepage slot → it appears on homepage carousel for selected dates\.

## 22\) Daily admin tasks checklist \(playbook\)

Every day the Admin team should:

1. Review Pending listings and approvals \(moderator\)\.
2. Check new verifications and approve&#x2F;ask for more documents\.
3. Monitor transactions and high\-value payouts \(finance\)\.
4. Review open tickets and respond within SLA \(support\)\.
5. Scan alerts for fraud or server issues \(security&#x2F;ops\)\.
6. Approve or schedule marketing banners or coupon campaigns \(marketing\)\.
7. Review analytics for drops in traffic or spikes in refunds \(product&#x2F;ops\)\.

## 23\) Example messages and user\-facing copy \(templates\)

**Listing rejected email:**

- Subject: &quot;Action needed: Problems with your listing &quot;\[Listing Title\]&quot;&quot;
- Body: &quot;Hi \[Business Name\], we reviewed your listing and found some issues: \[reason\]\. Please update your listing here: \[link\]\. If you need help reply to this message\.&quot;

**Verification request:**

- Subject: &quot;Please upload a document to verify your account&quot;
- Body: &quot;Hi \[Name\], to complete verification, please upload \[document type\] using this secure link: \[link\]\. We’ll review it within 48 hours\.&quot;

**Coupon claim notice to business:**

- &quot;New coupon available: \[Coupon name\]\. You can claim it in Marketing → Coupons\.&quot;

## 24\) Admin UI notes \(usability\)

- Search everywhere: allow Admin to search by name, email, listing id, transaction id\.
- One\-click actions for common tasks \(approve, suspend, refund small amounts\)\.
- Confirmations for big actions \(delete user, permanent ban\) with reason requirement\.
- Filters &amp; saved views: Admins can save frequently used filters \(e\.g\., &quot;Pending verifications \+ high value&quot;\)\.
- Bulk operations for repetitive tasks\.
- Activity log per object showing admin comments and changes\.

## 25\) Developer handoff checklist \(what to build\)

**Data and fields:** provide all fields listed above for users, businesses, listings, transactions, promotions, verifications, partnerships\.

**APIs &amp; integrations:** endpoints to change visibility, to fetch admin logs, to create coupons, and to run payouts\. \(Note: keep simple words in UI — developers will map these to technical names later\.\)

**Security &amp; roles:** implement role checks and two\-step approval for sensitive actions\.

**UI components required:**

- Tables with search, filters, bulk actions\.
- Detail views for user&#x2F;business&#x2F;listing&#x2F;transaction with action buttons\.
- Modal dialogues for quick edits and confirmations\.
- CMS editor for homepage and banners\.

**Automation:**

- Background job to send scheduled emails, expire coupons, and run payouts as scheduled\.

## 26\) Extra suggestions to make the Admin powerful and safe

- Add a sandbox mode for testing campaigns before they go live\.
- Flagging system with reason labels so moderators can quickly categorize problems\.
- Rate\-limiting and lockout for suspected fraud accounts\.
- Daily digest email to Admins with key items\.
- Simple built\-in help: contextual tips next to complex admin actions\.

## 27\) Wrapping up

This Admin session is the control center for everything on MCOMMALL\. Every page, promotion, listing, and user can be managed here\. The platform should give Admins clear ways to act, clear audit trails of what changed, and simple toggles to decide where content shows \(business dashboard, customer dashboard, marketplace, homepage\)\. The instructions above cover the full scope — sectors&#x2F;categories&#x2F;subcategories, promotions, listings, users, finance, disputes, marketing, and content — step\-by\-step and in plain English for developers to use as the blueprint\.

