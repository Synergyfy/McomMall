import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        try:
            # Set auth cookies
            await context.add_cookies([
                {'name': 'access', 'value': 'token', 'domain': 'localhost', 'path': '/'},
                {'name': 'userRole', 'value': 'admin', 'domain': 'localhost', 'path': '/'}
            ])

            print("Navigating to Service Templates...")
            await page.goto("http://localhost:3000/admin/templates/services")
            await page.wait_for_load_state("networkidle")

            # Wait for the input to be visible and correct
            pkg_name_input = page.locator('input[name="packages.0.name"]')
            await pkg_name_input.wait_for(state="visible", timeout=10000)

            # Verify the value
            value = await pkg_name_input.input_value()
            if value != "Basic Clean":
                raise Exception(f"Expected 'Basic Clean', got '{value}'")
            print("Found 'Basic Clean' package input correctly populated.")

            # Take screenshot
            await page.screenshot(path="/home/jules/verification/service_templates_success.png")
            print("Screenshot saved to /home/jules/verification/service_templates_success.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            raise e
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
