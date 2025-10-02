from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the new offer page
    page.goto("http://localhost:3000/dashboard/loyalty/offers/new")

    # Wait for the page to load
    expect(page.get_by_role("heading", name="Create Offer")).to_be_visible()

    # Select "Specific Listings" and take a screenshot
    page.get_by_label("Specific Listings").check()
    expect(page.get_by_label("Businesses")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/specific-listings.png")

    # Select "Specific Products" and take a screenshot
    page.get_by_label("Specific Products").check()
    expect(page.get_by_label("Included Products")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/specific-products.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)