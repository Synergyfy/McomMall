import re
from playwright.sync_api import Page, expect

def test_service_plus_feature_flow(page: Page):
    # 1. Login
    page.goto("http://localhost:3000/auth/login")
    page.get_by_placeholder("Enter your email").fill("owner@test.com")
    page.get_by_placeholder("Enter your password").fill("password")
    page.get_by_role("button", name="Login").click()
    expect(page).to_have_url(re.compile(".*dashboard"))

    # 2. Navigate to product page
    page.goto("http://localhost:3000/dashboard/store/products")
    # Click the first product link
    page.locator('a[href^="/dashboard/product/"]').first.click()
    expect(page).to_have_url(re.compile(".*/dashboard/product/.*"))

    # 3. Screenshot of Product Detail Page
    page.screenshot(path="jules-scratch/verification/01_product_detail_page.png")

    # 4. Open "Add Service Plus" Modal
    page.get_by_role("button", name="Add Service Plus").click()
    expect(page.get_by_role("heading", name="Add Service Plus Partner")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/02_add_service_modal.png")

    # 5. Search for a service
    page.get_by_placeholder("Search for services (e.g., 'plumbing')").fill("plumbing")
    page.get_by_role("button", name="Search").click()
    # Wait for search results to appear
    expect(page.get_by_text("by Tunde's Plumbing")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/03_service_search_results.png")

    # Close the modal
    page.get_by_role("button", name="Cancel").click()

    # 6. Navigate to Partnership Requests Page
    page.get_by_role("link", name="Partnerships").click()
    page.get_by_role("link", name="Partnership Requests").click()
    expect(page).to_have_url("http://localhost:3000/dashboard/partnerships/requests")
    expect(page.get_by_role("heading", name="Partnership Requests")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/04_partnership_requests_page.png")

    # 7. Navigate to My Partners Page
    page.get_by_role("link", name="Partnerships").click()
    page.get_by_role("link", name="My Partners").click()
    expect(page).to_have_url("http://localhost:3000/dashboard/partnerships/my-partners")
    expect(page.get_by_role("heading", name="My Partners")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/05_my_partners_page.png")