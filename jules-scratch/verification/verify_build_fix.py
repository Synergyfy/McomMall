from playwright.sync_api import Page, expect
import re

def test_build_fix_verification(page: Page):
    """
    This test verifies that the application builds and runs correctly after fixing the
    build error.
    """
    product_id = "d353d65a-e67e-4b1d-9201-f51745092d0d"

    # 1. Arrange: Go to the product page with the valid ID.
    page.goto(f"http://localhost:3000/products/{product_id}")

    # Wait for the main product title to be visible to ensure the page has loaded.
    expect(page.get_by_role("heading", level=1)).to_be_visible(timeout=20000)

    # 2. Act: Book a service.
    book_button = page.locator('.//button[contains(., "Book This Service")]').first()
    expect(book_button).to_be_visible()
    book_button.click()

    # Select a date, start time, and end time.
    page.get_by_role("button", name=re.compile(r"20")).first.click()
    page.get_by_role("combobox").first.click()
    page.get_by_role("option", name="09:00 AM").click()
    page.get_by_role("combobox").last.click()
    page.get_by_role("option", name="11:00 AM").click()

    # Confirm the booking.
    confirm_button = page.get_by_role("button", name="Confirm Booking")
    expect(confirm_button).to_be_visible()
    confirm_button.click()

    # 3. Act: Proceed to checkout.
    order_now_button = page.get_by_role("button", name="Order Now")
    expect(order_now_button).to_be_visible()
    order_now_button.click()

    # 4. Assert: Check that the checkout page has loaded and the booked service is displayed.
    expect(page).to_have_url(re.compile(r"/checkout"))
    expect(page.get_by_role("heading", name="Complete Your Purchase")).to_be_visible()

    # Check for the "Booked Services" section and the service name.
    expect(page.get_by_role("heading", name="Booked Services")).to_be_visible()

    # Verify the service name and that the price is displayed and correctly formatted.
    service_name_locator = page.get_by_text("Home Barista Training")
    expect(service_name_locator).to_be_visible()

    service_container = page.locator(".flex.items-center.justify-between", has=service_name_locator)
    price_regex = re.compile(r"\$\d+\.\d{2}")
    expect(service_container.get_by_text(price_regex)).to_be_visible()

    # 5. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/build_fix_verification.png")