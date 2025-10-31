const { test, expect } = require('@playwright/test');

test('Full Flow Verification', async ({ page }) => {
  // Navigate to the getstarted page
  await page.goto('http://localhost:3000/getstarted');

  // Click the "Create Account" button to navigate to the signup page
  await page.click('a:has-text("Create Account")');

  // Verify that the page has navigated to the signup page
  await expect(page).toHaveURL('http://localhost:3000/signup');

  // Now, on the signup page, verify the tooltips

  // Wait for the buttons to be visible
  await page.waitForSelector('button:has-text("Business")');
  await page.waitForSelector('button:has-text("Customer")');

  // Hover over the business button and take a screenshot
  await page.hover('button:has-text("Business")', { force: true });
  await page.waitForTimeout(500); // Give tooltip time to appear
  await page.screenshot({ path: 'jules-scratch/signup-tooltip-business.png' });

  // Hover over the customer button and take a screenshot
  await page.hover('button:has-text("Customer")', { force: true });
  await page.waitForTimeout(500); // Give tooltip time to appear
  await page.screenshot({ path: 'jules-scratch/signup-tooltip-customer.png' });
});
