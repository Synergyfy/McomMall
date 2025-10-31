
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("http://localhost:3000/getstarted")

        # Wait for the page to be fully loaded
        await page.wait_for_load_state('networkidle')

        await page.screenshot(path="jules-scratch/verification/getstarted-asymmetric-layout.png", full_page=True)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
