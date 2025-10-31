
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Verify the /getstarted page layout
        await page.goto("http://localhost:3000/getstarted")
        await page.screenshot(path="jules-scratch/verification/getstarted-layout.png")

        # Verify the tooltips on the /signup page
        await page.goto("http://localhost:3000/signup")

        # Hover over Customer button
        await page.hover('button:has-text("Customer")')
        await asyncio.sleep(1) # Wait for tooltip to appear
        await page.screenshot(path="jules-scratch/verification/signup-tooltip-customer.png")

        # Hover over Business button
        await page.hover('button:has-text("Business")')
        await asyncio.sleep(1) # Wait for tooltip to appear
        await page.screenshot(path="jules-scratch/verification/signup-tooltip-business.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
