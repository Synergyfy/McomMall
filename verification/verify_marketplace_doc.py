
from playwright.sync_api import sync_playwright, expect
import json

def test_marketplace(page):
    mock_data = {
        "heroSlides": [
            {
                "id": "banner-uuid-1234",
                "imageUrl": "https://placehold.co/800x400/png",
                "link": "/search?tag=summer",
                "displayOrder": 1,
                "title": "Summer Collection Launch"
            }
        ],
        "sidebarBanners": [
            {
                "id": "banner-uuid-5678",
                "imageUrl": "https://placehold.co/400x400/png",
                "link": "/partner/offer",
                "displayOrder": 1,
                "title": "Sidebar Ad",
                "type": "generic"
            }
        ],
        "categories": [
            {
                "id": "market-cat-uuid-9999",
                "name": "Tech & Gadgets",
                "iconName": "Smartphone",
                "targetCategoryId": "tax-cat-uuid-5678"
            }
        ],
        "sections": {
            "flash_sale": {
                "title": "Midnight Madness",
                "isVisible": True,
                "config": {
                    "endTime": "2026-01-21T00:00:00Z"
                },
                "productIds": ["prod-uuid-1"]
            }
        }
    }

    # Enable detailed logging
    page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
    page.on("request", lambda request: print(f"Request: {request.url}"))

    def handle_route(route):
        print(f"Intercepted API: {route.request.url}")
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(mock_data),
            headers={"Access-Control-Allow-Origin": "*"}
        )

    # Broad pattern
    page.route("**/*marketplace/public", handle_route)

    page.goto("http://localhost:3000/marketplace")

    # Wait for the content to appear
    expect(page.get_by_text("Summer Collection Launch")).to_be_visible(timeout=30000)

    # Check for the section title
    expect(page.get_by_text("Midnight Madness")).to_be_visible(timeout=30000)

    page.screenshot(path="/home/jules/verification/marketplace_doc_verification.png", full_page=True)
    print("Verification screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        try:
            test_marketplace(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/marketplace_doc_failure.png")
        finally:
            browser.close()
