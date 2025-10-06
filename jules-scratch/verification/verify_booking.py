from playwright.sync_api import Page, expect
import re

def test_service_booking_flow(page: Page):
    """
    This test verifies the entire service booking flow on the product page.
    """
    product_id = "d353d65a-e67e-4b1d-9201-f51745092d0d"

    # 1. Arrange: Go to the product page with the valid ID.
    page.goto(f"http://localhost:3000/products/{product_id}")

    # Wait for the main product title to be visible to ensure the page has loaded.
    expect(page.get_by_role("heading", level=1)).to_be_visible(timeout=20000)

    # 2. Act: Click the "Associated Services" tab.
    services_tab = page.get_by_role("tab", name="Associated Services")
    expect(services_tab).to_be_visible()
    services_tab.click()

    # 3. Act: Click the "Book This Service" button.
    book_button = page.locator('.//button[contains(., "Book This Service")]').first()
    expect(book_button).to_be_visible()
    book_button.click()

    # 4. Assert: Check that the date and time picker is visible.
    expect(page.get_by_text("Select a Date and Time")).to_be_visible()

    # 5. Act: Select a date and time
    # Pick the 20th day of the month. This assumes the 20th is available.
    page.get_by_role("button", name=re.compile(r"20")).first.click()

    # Select the first available time slot
    page.get_by_role("button", name=re.compile(r"09:00")).click()

    # 6. Assert: Check for the confirmation text.
    expect(page.get_by_text(re.compile(r"Selected: .* at 09:00"))).to_be_visible()

    # 7. Act: Confirm the booking
    confirm_button = page.get_by_role("button", name="Confirm Booking")
    expect(confirm_button).to_be_visible()
    confirm_button.click()

    # 8. Assert: Check for the success toast message.
    expect(page.get_by_text("Service booking has been scheduled and added to your checkout details.")).to_be_visible()

    # 9. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")