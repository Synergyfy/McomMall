from playwright.sync_api import sync_playwright, Page, expect
import json

def run(page: Page):
    # Mock the API response
    product_data = {
        "id": "test-product-id",
        "title": "Luxury Villa Rental (Mock)",
        "category": "Real Estate",
        "price": 5000,
        "salePrice": 4500,
        "description": "A beautiful villa with amazing views. \n\nFeatures include pool, garden, and more.",
        "shortDescription": "Luxury Villa",
        "imageUrl": "https://via.placeholder.com/800x600",
        "fileUrls": [
            "https://via.placeholder.com/800x600/ff7f7f/333333?text=Image+1",
            "https://via.placeholder.com/800x600/7f7fff/333333?text=Image+2"
        ],
        "productStatus": "published",
        "sku": "VILLA-001",
        "stock": 1,
        "enableStockManagement": True,
        "weight": 0,
        "length": 0,
        "width": 0,
        "height": 0,
        "business": {
            "businessName": "Luxury Estates Ltd",
            "logoUrl": "https://via.placeholder.com/100",
            "user": {
                "name": "John Realtor",
                "createdAt": "2023-01-01T00:00:00Z"
            }
        },
        "variants": [
            {
                "name": "Duration",
                "type": "select",
                "options": [
                    { "name": "1 Week", "priceModifier": 0 },
                    { "name": "2 Weeks", "priceModifier": 4000 }
                ]
            },
            {
                "name": "Extras",
                "type": "radio",
                "options": [
                    { "name": "None", "priceModifier": 0 },
                    { "name": "Chef Included", "priceModifier": 1500 }
                ]
            }
        ]
    }

    print("Interpreting route...")
    page.route("**/product/test-product-id", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps(product_data)
    ))

    print("Navigating...")
    page.goto("http://localhost:3000/products/test-product-id")

    print("Waiting for content...")
    expect(page.get_by_text("Description")).to_be_visible(timeout=30000)

    print("Waiting for price...")
    expect(page.get_by_text("£4500.00")).to_be_visible()

    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/product_page_v2.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 1000})
        try:
            run(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
