import { chromium } from 'playwright';

async function verify() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log("Navigating to Add Service page...");
    const response = await page.goto("http://localhost:3000/dashboard/services/add-service");
    console.log("Status:", response?.status());
    console.log("Current URL:", page.url());

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000); // Wait for component to render

    await page.screenshot({ path: "/home/jules/verification/step1_v9.png", fullPage: true });

    console.log("Testing validation...");
    // Click Next without filling anything
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "/home/jules/verification/step1_validation_v9.png", fullPage: true });

    await browser.close();
}

verify().catch(console.error);
