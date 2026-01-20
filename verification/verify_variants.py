from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()

    # Mock the product API
    page.route("**/product/123", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''{
            "id": "123",
            "title": "Test Product with Variants",
            "price": 20.00,
            "salePrice": null,
            "category": "Clothing",
            "description": "A nice t-shirt",
            "imageUrl": "https://via.placeholder.com/500",
            "variants": [
                {
                    "name": "Color",
                    "type": "select",
                    "options": [
                        { "name": "Red", "quantity": 10, "priceModifier": 0 },
                        { "name": "Blue", "quantity": 10, "priceModifier": 5 }
                    ]
                },
                {
                    "name": "Size",
                    "type": "radio",
                    "options": [
                        { "name": "M", "quantity": 10, "priceModifier": 0 },
                        { "name": "L", "quantity": 10, "priceModifier": 2 }
                    ]
                }
            ]
        }'''
    ))

    # Go to the product page
    page.goto("http://localhost:3000/products/123")

    # Wait for the product to load
    expect(page.get_by_text("Test Product with Variants")).to_be_visible()

    # Verify initial price
    expect(page.get_by_text("£20.00")).to_be_visible()

    # Select Blue (+5) via Select
    page.get_by_role("combobox").click()
    page.get_by_role("option", name="Blue").click()

    # Verify price update. 20 + 5 = 25.
    expect(page.get_by_text("£25.00")).to_be_visible()

    page.screenshot(path="verification/debug_before_radio.png")

    # Select L (+2) via Radio
    # Trying to find the text "L" inside a label
    # page.locator("label").filter(has_text="L").click()
    # Or just click the radio button directly by ID if I can guess it.
    # ID is `${variant.name}-${option.name}` -> "Size-L"
    page.locator("#Size-L").click()

    # Verify price update. 25 + 2 = 27.
    expect(page.get_by_text("£27.00")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
