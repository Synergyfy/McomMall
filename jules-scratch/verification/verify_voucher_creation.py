from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login
    page.goto("http://localhost:3000/")
    page.get_by_role("button", name="Sign In").click()

    # Wait for the login modal to appear
    page.wait_for_selector("h2:has-text('Login')")

    page.get_by_placeholder("Enter your email").fill("owner@test.com")
    page.get_by_placeholder("Your password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Navigate to the create voucher product page
    page.goto("http://localhost:3000/dashboard/vouchers/products/create")

    # Wait for the page to load
    page.wait_for_selector("h1:has-text('Create New Voucher Product')")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
