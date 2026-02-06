
import { test, expect } from '@playwright/test';

test('verify add service steps', async ({ page }) => {
  // Go to the add service page
  await page.goto('http://localhost:3000/dashboard/services/add-service');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Log the page title and some content to verify we are on the right page
  console.log('Page title:', await page.title());
  const content = await page.textContent('body');
  console.log('Body content length:', content?.length);

  // Check for the heading of Step 1
  const step1Heading = page.getByText('Service Basic Information', { exact: false });
  if (await step1Heading.isVisible()) {
      console.log('Step 1 heading found!');
  } else {
      console.log('Step 1 heading NOT found. Content might be hidden or not rendered.');
      // Take a screenshot to debug
      await page.screenshot({ path: '/home/jules/verification/debug_step1.png', fullPage: true });
  }

  // Try to find the Next button
  const nextButton = page.getByRole('button', { name: /next/i });
  if (await nextButton.isVisible()) {
    console.log('Next button found!');
    await nextButton.click();

    // Wait for Step 2
    await page.waitForTimeout(1000);
    const step2Heading = page.getByText('Service Media', { exact: false });
    if (await step2Heading.isVisible()) {
      console.log('Step 2 reached.');
    } else {
      console.log('Step 2 heading NOT found.');
    }
    await page.screenshot({ path: '/home/jules/verification/debug_step2.png', fullPage: true });
  } else {
    console.log('Next button NOT found.');
  }
});
