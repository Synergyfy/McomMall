from playwright.sync_api import Page, expect
import re

def test_order_now_flow(page: Page):
    """
    This test verifies the corrected "Order Now" button flow.
    """
    product_id = "d353d65a-e67e-4b1d-9201-f51745092d0d"

    # 1. Arrange: Go to the product page with the valid ID.
    page.goto(f"http://localhost:3000/products/{product_id}")

    # Wait for the main product title to be visible to ensure the page has loaded.
    expect(page.get_by_role("heading", level=1)).to_be_visible(timeout=20000)

    # 2. Act: Change the quantity to 3.
    plus_button = page.get_by_role("button", name=re.compile(r"Plus"))
    plus_button.click()
    plus_button.click()

    # Assert that the quantity is now 3.
    expect(page.locator(".w-16.text-center")).to_have_text("3")

    # 3. Act: Click the "Order Now" button.
    order_now_button = page.get_by_role("button", name="Order Now")
    expect(order_now_button).to_be_visible()
    order_now_button.click()

    # 4. Assert: Check that the URL is correct and the checkout page has loaded.
    expect(page).to_have_url(f"http://localhost:3000/checkout?productId={product_id}&quantity=3")
    expect(page.get_by_role("heading", name="Complete Your Purchase")).to_be_visible()

    # 5. Assert: Check that the quantity on the checkout page's order summary is correct.
    # The OrderSummaryCard component should reflect the quantity.
    # We will look for an element that displays the quantity in the summary.
    # A robust way is to find the product row and then the quantity within it.
    # Assuming the product title is visible in the summary.
    expect(page.get_by_text("x 3")).to_be_visible()

    # 6. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/order_now_verification.png")