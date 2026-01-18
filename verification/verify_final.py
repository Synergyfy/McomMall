from playwright.sync_api import sync_playwright

def verify_cashback_and_pricing():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context with service workers blocked to ensure mocks work
        context = browser.new_context(service_workers="block")

        # Inject cookies to bypass login
        context.add_cookies([
            {"name": "access", "value": "mock-access-token", "domain": "localhost", "path": "/"},
            {"name": "refresh", "value": "mock-refresh-token", "domain": "localhost", "path": "/"}
        ])

        page = context.new_page()

        # --- Cashback Mocks ---
        page.route("**/cashback/balance", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"balance": "125.50"}'
        ))

        page.route("**/cashback/rules", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='''[
                {
                    "id": "1",
                    "platform": "MCOM_MALL",
                    "eventType": "GIFT_CARD_PURCHASE",
                    "rewardType": "PERCENTAGE",
                    "rewardValue": 2.5,
                    "isActive": true,
                    "createdAt": "2024-03-15T10:00:00.000Z",
                    "updatedAt": "2024-03-15T10:00:00.000Z",
                    "adminId": "admin-1"
                }
            ]'''
        ))

        page.route("**/cashback/history*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='''{
                "data": [
                    {
                        "id": "tx-1",
                        "amount": "2.50",
                        "type": "CREDIT",
                        "sourcePlatform": "MCOM_MALL",
                        "eventType": "GIFT_CARD_PURCHASE",
                        "createdAt": "2024-03-21T09:15:00.000Z"
                    }
                ],
                "meta": {
                    "total": 1,
                    "page": 1,
                    "limit": 10,
                    "totalPages": 1
                }
            }'''
        ))

        # --- Tiers Mocks (Validating schema fix) ---
        # Mocking the response with the *new* schema including quarterlyPrice
        page.route("**/tiers", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='''[
              {
                "id": "gold-plan",
                "name": "Gold Plan",
                "description": "Premium tier",
                "monthlyPrice": "29.99",
                "quarterlyPrice": "79.99",
                "annualPrice": "299.99",
                "stripeMonthlyPriceId": "price_123",
                "stripeQuarterlyPriceId": "price_789",
                "stripeAnnualPriceId": "price_456",
                "paypalMonthlyPlanId": "P-123",
                "paypalQuarterlyPlanId": "P-789",
                "paypalAnnualPlanId": "P-456",
                "configuration": {
                  "quotas": {
                    "maxListings": 100,
                    "allowProductListing": true,
                    "allowServiceListing": true,
                    "maxProducts": 50,
                    "maxServices": 50,
                    "maxGiftCardTemplates": 5,
                    "maxCouponTemplates": 10,
                    "maxLoyaltyPrograms": 1,
                    "maxImagesPerListing": 5,
                    "featuredListingAllowance": 2
                  },
                  "featureFlags": {
                    "priorityInSearch": true,
                    "advancedAnalytics": true,
                    "dedicatedSupport": true,
                    "allowCustomBranding": false,
                    "allowGroupCreation": true
                  }
                },
                "isActive": true
              }
            ]'''
        ))

        page.route("**/auth/profile", lambda route: route.fulfill(status=200, body='{"firstName": "Test", "lastName": "User", "role": "CUSTOMER"}'))
        page.route("**/taxonomy/sectors", lambda route: route.fulfill(status=200, body="[]"))

        try:
            # 1. Verify Cashback
            print("Verifying Cashback...")
            page.goto("http://localhost:3000/dashboard/cashback", timeout=60000)
            page.wait_for_selector("text=125.50", timeout=10000)
            page.screenshot(path="/home/jules/verification/final_cashback.png")
            print("Cashback verified.")

            # 2. Verify Pricing (if accessible)
            # Since I updated the hook, I want to verify that the app doesn't crash when it receives quarterlyPrice
            # and that it (presumably) works if I were to go to a page using it.
            # I'll check dashboard/my-subscription
            print("Verifying Subscription Page...")
            page.goto("http://localhost:3000/dashboard/my-subscription", timeout=60000)
            # If the mapping works, the page should load without error.
            # I can't easily verify the quarterly price is *displayed* without knowing the UI,
            # but I can check if "Gold Plan" text appears.
            page.wait_for_selector("text=Gold Plan", timeout=10000)
            page.screenshot(path="/home/jules/verification/subscription_page.png")
            print("Subscription verified.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_final.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cashback_and_pricing()
