import { test, expect } from '@playwright/test';

test.describe('Get Started Page Desktop View', () => {
  test('should display the curved divider and correct column layout', async ({ page }) => {
    // Set a desktop viewport.
    await page.setViewportSize({ width: 1280, height: 720 });

    // Go to the page with a longer timeout.
    await page.goto('http://localhost:3000/getstarted', { timeout: 60000 });

    // Wait for a key element to be visible before taking the screenshot.
    await page.waitForSelector('h1:has-text("Lets Make living life easier.")', { timeout: 30000 });

    // Take a screenshot to visually verify the layout.
    await page.screenshot({ path: 'jules-scratch/getstarted-desktop-curved.png' });
  });
});
