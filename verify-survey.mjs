import { chromium } from '@playwright/test';

const TEST_URL = 'http://localhost:3000';
const LOGIN_EMAIL = 'test-male@example.com';
const LOGIN_PASSWORD = 'password123';

async function verifySurvey() {
  let browser;
  try {
    console.log('🌐 Starting browser...');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // Go to home page
    console.log('📍 Navigating to home page...');
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    
    // Check if login link exists and navigate to login
    console.log('📍 Looking for login...');
    const loginButton = await page.locator('a:has-text("로그인"), button:has-text("로그인")').first();
    
    if (await loginButton.isVisible()) {
      console.log('✅ Found login button');
      await loginButton.click();
      await page.waitForLoadState('networkidle');
    } else {
      // Try direct navigation
      console.log('📍 Trying direct navigation to login...');
      await page.goto(`${TEST_URL}/login`, { waitUntil: 'networkidle' });
    }

    // Fill in login form
    console.log('📝 Filling login form...');
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    
    // Submit
    console.log('🔐 Submitting login...');
    await page.click('button:has-text("로그인"), button:has-text("Sign In"), button:has-text("Submit")');
    
    // Wait for navigation
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Login completed, current URL:', page.url());

    // Navigate to survey
    console.log('📍 Navigating to survey page...');
    await page.goto(`${TEST_URL}/survey`, { waitUntil: 'networkidle' });
    console.log('✅ Survey page loaded, URL:', page.url());

    // Wait for "시작하기" button
    console.log('🔍 Looking for "시작하기" button...');
    await page.waitForSelector('button:has-text("시작하기"), button:has-text("시작하기")', { timeout: 5000 });
    
    // Click the button
    console.log('🖱️  Clicking "시작하기"...');
    await page.click('button:has-text("시작하기")');
    
    // Wait for world cup section to load
    await page.waitForLoadState('networkidle');
    
    // Check for images
    console.log('🔍 Checking for celebrity images...');
    const images = await page.locator('img[src*="celebrities"]').all();
    console.log(`✅ Found ${images.count} images`);
    
    if (images.length > 0) {
      console.log('📸 First image URL:', await images[0].getAttribute('src'));
      
      // Check if images are actually loaded
      for (let i = 0; i < Math.min(images.length, 3); i++) {
        const src = await images[i].getAttribute('src');
        const alt = await images[i].getAttribute('alt');
        console.log(`  [${i+1}] ${alt || 'no-alt'}: ${src}`);
      }
    }

    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'survey-verification.png', fullPage: true });
    console.log('✅ Screenshot saved: survey-verification.png');

    await browser.close();
    console.log('✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

verifySurvey();
