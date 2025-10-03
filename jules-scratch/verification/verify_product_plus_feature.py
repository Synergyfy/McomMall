from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to homepage and open login modal
        page.goto("http://localhost:3000/")
        page.get_by_role("button", name="Sign In").first.click()

        # Wait for dialog to appear, then login
        dialog = page.get_by_role("dialog")
        expect(dialog).to_be_visible()
        expect(dialog.get_by_role("heading", name="Login")).to_be_visible()
        dialog.get_by_label("Email").fill("owner@example.com")
        dialog.get_by_label("Password").fill("password")
        dialog.get_by_role("button", name="Submit").click()
        expect(page).to_have_url("http://localhost:3000/dashboard", timeout=10000)

        # Navigate to products page
        page.goto("http://localhost:3000/dashboard/store/products")
        expect(page.get_by_role("heading", name="Store Dashboard")).to_be_visible()

        # Click on the first product link
        first_product_link = page.locator('a[href^="/dashboard/product/"]').first
        expect(first_product_link).to_be_visible(timeout=10000)
        product_href = first_product_link.get_attribute("href")
        first_product_link.click()

        # Verify product details page
        expect(page).to_have_url(f"http://localhost:3000{product_href}")
        expect(page.get_by_role("button", name="Add service plus")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/product_details_page.png")

        # Open and verify "Add service plus" modal
        page.get_by_role("button", name="Add service plus").click()
        service_modal = page.get_by_role("dialog")
        expect(service_modal.get_by_role("heading", name="Add Service Plus")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/service_plus_modal.png")
        service_modal.get_by_role("button", name="Cancel").click()

        # Navigate to Partnership Requests page
        page.goto("http://localhost:3000/dashboard/marketing/partnership-requests")
        expect(page.get_by_role("heading", name="Partnership Requests")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/partnership_requests_page.png")

        # Navigate to My Partners page
        page.goto("http://localhost:3000/dashboard/marketing/my-partners")
        expect(page.get_by_role("heading", name="My Partners")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/my_partners_page.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)