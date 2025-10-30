
import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:3000/signin")
    page.get_by_label("Email").fill("test@test.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Submit").click()
    expect(page).to_have_url("http://localhost:3000/")

    # Navigate to My Vouchers page
    page.goto("http://localhost:3000/dashboard/history/my-vouchers")
    expect(page).to_have_url("http://localhost:3000/dashboard/history/my-vouchers")

    # Click the "Reload" button
    reload_button = page.get_by_role("button", name="Reload").first
    reload_button.click()

    # Wait for the modal to appear
    expect(page.get_by_role("dialog")).to_be_visible()

    # Fill out the form
    page.get_by_label("Amount").fill("10")
    page.get_by_label("Stripe").check()
    page.get_by_role("button", name="Proceed to Payment").click()

    # Wait for the payment form to appear and take a screenshot
    expect(page.get_by_text("Pay now")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/payment-processing.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
