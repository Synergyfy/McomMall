from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/dashboard/add-listing", timeout=60000)
    page.wait_for_load_state("networkidle")
    page.locator('[data-testid="business-type-Product"]').click()
    page.get_by_role("button", name="Next").click()
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
