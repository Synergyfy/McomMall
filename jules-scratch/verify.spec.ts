import { test, expect } from '@playwright/test';

test.describe('Get Started Page', () => {
  test('should be responsive and stack columns on mobile', async ({ page }) => {
    // Set a mobile viewport.
    await page.setViewportSize({ width: 375, height: 667 });

    // Go to the page with a longer timeout.
    await page.goto('http://localhost:3000/getstarted', { timeout: 60000 });

    // Wait for a key element to be visible before taking the screenshot.
    await page.waitForSelector('h1:has-text("Lets Make living life easier.")', { timeout: 30000 });

    // Take a screenshot to visually verify the layout.
    await page.screenshot({ path: 'jules-scratch/getstarted-mobile.png' });
  });
});
