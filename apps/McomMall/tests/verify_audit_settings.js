const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\a9bf2435-1983-4e91-a48c-0777aabe830a';

async function run() {
  console.log('Starting Playwright dashboard checks...');
  let browser;
  try {
    console.log('Trying to launch system Google Chrome...');
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  } catch (e) {
    console.log('Google Chrome launch failed, trying Microsoft Edge...');
    try {
      browser = await chromium.launch({ headless: true, channel: 'msedge' });
    } catch (edgeErr) {
      console.log('Microsoft Edge launch failed, falling back to default chromium...');
      browser = await chromium.launch({ headless: true });
    }
  }
  
  // Set context with 1280x800 viewport
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  // Inject authentication cookies
  await context.addCookies([
    { name: 'access', value: 'mock_access_token', domain: 'localhost', path: '/' },
    { name: 'refresh', value: 'mock_refresh_token', domain: 'localhost', path: '/' },
    { name: 'userId', value: 'mock_user_id', domain: 'localhost', path: '/' },
    { name: 'userRole', value: 'owner', domain: 'localhost', path: '/' },
    { name: 'packageInfo', value: JSON.stringify({ planType: 'annual' }), domain: 'localhost', path: '/' }
  ]);

  const page = await context.newPage();

  // Console debugging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  // Set local storage values
  await page.addInitScript(() => {
    window.localStorage.setItem('user-name', 'Merchant Onboarding');
  });

  // Setup mock endpoints
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    console.log(`[MOCK API Intercepted] ${method} ${url}`);

    if (url.includes('/users/me')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock_user_id',
          name: 'Merchant Onboarding',
          firstName: 'John',
          lastName: 'Doe',
          email: 'merchant@example.com',
          phoneNumber: '+1234567890',
          isActive: true,
          isEmailVerified: true,
          role: 'owner',
          socials: {
            id: 'social_mock',
            instagram: 'https://instagram.com/mockbusiness',
            facebook: 'https://facebook.com/mockbusiness'
          },
          profilePictureUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCT-HaLvjePg65iRrx4YYbgRF58m0nK-2Kz-Q6WSxtWRQjJY5o8OxqWiNpqmNeLE-stCUd77MWrqpWiGy3NR0IKqiPK0r_twbSS87xb-d2jbOnINzoBzQULSvX2kwE9z1p-EVnJIk305OYCYb7mY1vPKTEbbcCNKiHSC3IVsPY38hFxI1Jrdmf4Pqu1YhvkMh4yE4vrRgAINTGJ5VlHoX-lL6hVPjkK_dKnM2xPozkML99obkSeM821-0Jh5ZbxTvEC-3dlf2Hksrf'
        })
      });
    } else if (url.includes('/listings/mine')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'mock_listing_id',
              businessName: 'Synergyfy Store',
              logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCT-HaLvjePg65iRrx4YYbgRF58m0nK-2Kz-Q6WSxtWRQjJY5o8OxqWiNpqmNeLE-stCUd77MWrqpWiGy3NR0IKqiPK0r_twbSS87xb-d2jbOnINzoBzQULSvX2kwE9z1p-EVnJIk305OYCYb7mY1vPKTEbbcCNKiHSC3IVsPY38hFxI1Jrdmf4Pqu1YhvkMh4yE4vrRgAINTGJ5VlHoX-lL6hVPjkK_dKnM2xPozkML99obkSeM821-0Jh5ZbxTvEC-3dlf2Hksrf',
              status: 'published',
              isVerified: true
            }
          ],
          meta: {
            total: 1,
            page: 1,
            lastPage: 1
          }
        })
      });
    } else if (url.includes('/membership/my')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock_membership_id',
          isActive: true,
          expiresAt: '2027-12-31T23:59:59.000Z',
          planType: 'annual',
          created_at: '2026-01-01T00:00:00.000Z',
          trialDuration: 30,
          tier: {
            id: 'mock_tier_id',
            name: 'Gold Tier Pro',
            annual_price: '299.00',
            monthly_price: '29.99'
          }
        })
      });
    } else if (url.includes('/payments/status')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'TRIAL_ACTIVE',
          trialEndDate: '2027-12-31T23:59:59.000Z',
          tasks: {
            createdBusiness: true,
            createdProductOrService: true,
            createdPromotion: true,
            createdOffer: true,
            createdCoupon: true
          }
        })
      });
    } else if (url.includes('/team/mock_listing_id')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          members: [
            {
              id: 'member_1',
              userId: 'mock_user_id',
              name: 'John Doe (You)',
              email: 'merchant@example.com',
              role: 'manager',
              status: 'active'
            },
            {
              id: 'member_2',
              userId: 'user_alice',
              name: 'Alice Smith',
              email: 'alice@example.com',
              role: 'staff',
              status: 'active'
            },
            {
              id: 'member_3',
              userId: 'user_bob',
              name: 'Bob Jones',
              email: 'bob@example.com',
              role: 'agent',
              status: 'active'
            }
          ],
          invites: []
        })
      });
    } else if (url.includes('/business/audits/latest')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock_audit_id',
          businessId: 'mock_listing_id',
          score: 85,
          suggestions: [
            {
              id: 'sug_1',
              title: 'Enable Loyalty Program',
              description: 'Increase returning customer frequency by enabling point allocation.',
              actionLink: '/dashboard/loyalty',
              impact: 'HIGH'
            },
            {
              id: 'sug_2',
              title: 'Add Rich Media to Listings',
              description: 'Businesses with 5+ photos receive 30% more community views.',
              actionLink: '/dashboard/storefront/appearance',
              impact: 'MEDIUM'
            }
          ],
          createdAt: '2026-06-19T12:00:00.000Z'
        })
      });
    } else if (url.includes('/stats/reports')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          period: 'weekly',
          metrics: {
            monthlyReach: 5420,
            conversionRate: 8.2,
            engagementRate: 12.4,
            boroughRank: 3
          }
        })
      });
    } else if (url.includes('/notifications') || url.includes('/support-tickets')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]'
      });
    } else if (url.includes('/wishlist')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] })
      });
    } else if (url.endsWith('/stats')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalOrders: 0,
          totalSpent: 0,
          promotionPoints: 0,
          promotionsParticipating: 0
        })
      });
    } else {
      // Fallback for other API requests to avoid errors
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}'
      });
    }
  });

  try {
    // -------------------------------------------------------------
    // Verify Settings Page
    // -------------------------------------------------------------
    console.log('Navigating to Settings page...');
    await page.goto('http://localhost:3000/dashboard/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Allow react state to render completely

    console.log('Asserting Settings page components...');
    
    // Check Business Name
    const businessNameLoc = page.getByText('Synergyfy Store');
    if (await businessNameLoc.isVisible()) {
      console.log('  ✅ Business Name "Synergyfy Store" is visible.');
    } else {
      throw new Error('Business Name "Synergyfy Store" is not visible.');
    }

    // Check Active Status Badge
    const statusLoc = page.getByText('Active', { exact: true });
    if (await statusLoc.isVisible()) {
      console.log('  ✅ Status Badge "Active" is visible.');
    } else {
      throw new Error('Status Badge "Active" is not visible.');
    }

    // Check completeness profile message
    const completenessLoc = page.getByText('Profile 100% complete');
    if (await completenessLoc.isVisible()) {
      console.log('  ✅ Completeness meter "Profile 100% complete" is visible.');
    } else {
      throw new Error('Completeness meter is not visible or has wrong percentage.');
    }

    // Check Team Members Count (Expected: 3 active team members)
    const teamLoc = page.getByText('3', { exact: true });
    if (await teamLoc.isVisible()) {
      console.log('  ✅ Active Team Members Count "3" is visible.');
    } else {
      throw new Error('Active Team Members Count "3" is not visible.');
    }

    // Check price and active tier
    const priceLoc = page.getByText('$299.00');
    if (await priceLoc.isVisible()) {
      console.log('  ✅ Price "$299.00" is visible.');
    } else {
      throw new Error('Price "$299.00" is not visible.');
    }

    // Take screenshot of settings page
    const settingsScreenshotPath = path.join(ARTIFACTS_DIR, 'settings_success.png');
    await page.screenshot({ path: settingsScreenshotPath, fullPage: true });
    console.log(`  📸 Settings page screenshot saved to ${settingsScreenshotPath}`);

    // -------------------------------------------------------------
    // Verify Audits & Membership Page
    // -------------------------------------------------------------
    console.log('Navigating to Membership & Audits page...');
    await page.goto('http://localhost:3000/dashboard/membership-audits');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Allow react state to render completely

    console.log('Asserting Membership & Audits page components...');

    // Check active member tier header
    const tierHeaderLoc = page.getByRole('heading', { name: 'Gold Tier Pro Member' });
    if (await tierHeaderLoc.isVisible()) {
      console.log('  ✅ Header "Gold Tier Pro Member" is visible.');
    } else {
      throw new Error('Header "Gold Tier Pro Member" is not visible.');
    }

    // Check Circle Gauge values (Completeness: 78%, Growth Audit: 85%)
    const gaugeStorefront = page.getByText('78%');
    const gaugeAudit = page.getByText('85%');
    if (await gaugeStorefront.isVisible() && await gaugeAudit.isVisible()) {
      console.log('  ✅ Storefront (78%) and Audit (85%) score gauges are visible.');
    } else {
      throw new Error('Circle score gauges are not rendering correctly.');
    }

    // Check AI Recommendation items
    const sugLoc = page.getByText('Enable Loyalty Program');
    if (await sugLoc.isVisible()) {
      console.log('  ✅ AI Recommendation "Enable Loyalty Program" is visible.');
    } else {
      throw new Error('AI Recommendation is not visible.');
    }

    // Check Weekly metrics
    const reachLoc = page.getByText('5,420');
    const rankLoc = page.getByText('#3');
    if (await reachLoc.isVisible() && await rankLoc.isVisible()) {
      console.log('  ✅ Weekly reach (5,420) and borough rank (#3) are visible.');
    } else {
      throw new Error('Weekly snapshot metrics are not rendering correctly.');
    }

    // Take screenshot of audits page
    const auditsScreenshotPath = path.join(ARTIFACTS_DIR, 'membership_audits_success.png');
    await page.screenshot({ path: auditsScreenshotPath, fullPage: true });
    console.log(`  📸 Membership & Audits page screenshot saved to ${auditsScreenshotPath}`);

    console.log('🎉 All checks passed successfully!');
  } catch (error) {
    console.error('❌ Check execution failed:', error.message);
    const failureScreenshotPath = path.join(ARTIFACTS_DIR, 'verification_failure.png');
    await page.screenshot({ path: failureScreenshotPath, fullPage: true });
    console.log(`  📸 Failure screenshot saved to ${failureScreenshotPath}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
