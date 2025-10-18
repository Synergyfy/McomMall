from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Replace with a valid business ID if you have one
    business_id = "a1b2c3d4-e5f6-7890-1234-567890abcdef"

    page.goto(f"http://localhost:3002/business/{business_id}")

    page.wait_for_selector("text=Welcome to Our Store")

    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)