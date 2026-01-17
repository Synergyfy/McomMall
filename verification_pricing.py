from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(service_workers="block")
    page = context.new_page()

    # Route request to log urls
    page.route("**/*", lambda route: route.continue_())

    page.route("**/api/v1/tiers", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''[
    {
        "id": "4bc5ea98-9588-4439-bf7b-6a44db37efaf",
        "createdAt": "2026-01-13T16:37:17.182Z",
        "updatedAt": "2026-01-13T16:37:17.182Z",
        "deletedAt": null,
        "name": "Basic",
        "description": null,
        "monthlyPrice": "10.00",
        "annualPrice": "100.00",
        "stripeMonthlyPriceId": null,
        "stripeAnnualPriceId": null,
        "paypalMonthlyPlanId": null,
        "paypalAnnualPlanId": null,
        "configuration": {
            "quotas": {
                "maxListings": 5,
                "maxProducts": 10,
                "maxServices": 5,
                "maxCouponTemplates": 1,
                "maxLoyaltyPrograms": 0,
                "allowProductListing": true,
                "allowServiceListing": true,
                "maxImagesPerListing": 3,
                "maxGiftCardTemplates": 1,
                "featuredListingAllowance": 0
            },
            "featureFlags": {
                "dedicatedSupport": false,
                "priorityInSearch": false,
                "advancedAnalytics": false,
                "allowGroupCreation": false,
                "allowCustomBranding": false
            }
        },
        "isActive": true
    }
]'''
    ))

    try:
        response = page.goto("http://localhost:3000/pricing", timeout=60000)
        print(f"Page loaded with status: {response.status}")

        # Take a screenshot immediately to see what's rendering
        page.screenshot(path="debug_pricing_initial.png", full_page=True)

        # Wait for the "Basic" text, but dump content if it fails
        try:
             page.wait_for_selector("text=Basic", timeout=10000)
             print("Found 'Basic' selector")
        except Exception as e:
             print(f"Selector not found: {e}")
             print("Page content dump:")
             # print(page.content()) # Commented out to avoid cluttering logs too much unless needed

        page.screenshot(path="verification_pricing.png", full_page=True)
        print("Final screenshot taken")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification_error.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
