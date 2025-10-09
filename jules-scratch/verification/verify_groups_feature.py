import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        # Set a mock authentication cookie to bypass login
        await context.add_cookies([{
            "name": "access",
            "value": "mock_access_token",
            "url": "http://localhost:3000"
        }])

        page = await context.new_page()

        # Verify Membership Page
        await page.goto("http://localhost:3000/dashboard/marketing/membership")
        await expect(page.get_by_role("heading", name="Membership")).to_be_visible()
        await page.screenshot(path="jules-scratch/verification/membership-page.png")

        # Verify Create Group Page
        await page.goto("http://localhost:3000/dashboard/marketing/groups/new")
        await expect(page.get_by_role("heading", name="Create a New Group")).to_be_visible()
        await page.screenshot(path="jules-scratch/verification/create-group-page.png")

        # Verify My Groups Page
        await page.goto("http://localhost:3000/dashboard/marketing/groups")
        await expect(page.get_by_role("heading", name="My Groups")).to_be_visible()
        await page.screenshot(path="jules-scratch/verification/my-groups-page.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())