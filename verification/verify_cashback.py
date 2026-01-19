from playwright.sync_api import sync_playwright

def verify_cashback():
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

        # Mock Balance
        page.route("**/cashback/balance", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"balance": "125.50"}'
        ))

        # Mock Rules
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
                },
                 {
                    "id": "2",
                    "platform": "MCOM_LOYALTY",
                    "eventType": "REFERRAL",
                    "rewardType": "FIXED",
                    "rewardValue": 5.00,
                    "isActive": true,
                    "createdAt": "2024-03-15T10:00:00.000Z",
                    "updatedAt": "2024-03-15T10:00:00.000Z",
                    "adminId": "admin-1"
                }
            ]'''
        ))

        # Mock History
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
                    },
                    {
                        "id": "tx-2",
                        "amount": "10.00",
                        "type": "DEBIT",
                        "sourcePlatform": "MCOM_MALL",
                        "eventType": "WITHDRAWAL",
                        "createdAt": "2024-03-20T09:15:00.000Z"
                    }
                ],
                "meta": {
                    "total": 2,
                    "page": 1,
                    "limit": 10,
                    "totalPages": 1
                }
            }'''
        ))

        # Mock Taxonomy and Profile which might be needed for the Layout/Nav
        page.route("**/taxonomy/sectors", lambda route: route.fulfill(status=200, body="[]"))
        page.route("**/auth/profile", lambda route: route.fulfill(status=200, body='{"firstName": "Test", "lastName": "User", "role": "CUSTOMER"}'))

        try:
            print("Navigating to page...")
            # Navigate to the page
            page.goto("http://localhost:3000/dashboard/cashback", timeout=60000)

            print("Waiting for content...")
            # Wait for content to load
            page.wait_for_selector("text=Cashback Balance", timeout=30000)
            page.wait_for_selector("text=125.50", timeout=10000)

            print("Taking screenshot...")
            # Take screenshot
            page.screenshot(path="/home/jules/verification/cashback_page.png", full_page=True)
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cashback()
