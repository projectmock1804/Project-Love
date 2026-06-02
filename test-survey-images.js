const { chromium } = require('@playwright/test');

async function testSurveyImages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    // Navigate to survey page
    console.log('📍 Navigating to survey page...');
    await page.goto('http://localhost:3000/survey', { waitUntil: 'networkidle' });

    // Check if we need to log in
    const loginButton = await page.$('button:has-text("로그인")');
    if (loginButton) {
      console.log('🔑 Login page detected. Logging in...');

      // Fill email
      await page.fill('input[type="email"]', 'test-celebrity@example.com');

      // Fill password
      await page.fill('input[type="password"]', 'password123');

      // Click login button
      await page.click('button:has-text("로그인")');

      // Wait for redirect to survey
      await page.waitForURL('**/survey');
      console.log('✅ Login successful');
    }

    // Wait for intro page to load
    await page.waitForSelector('button:has-text("시작하기")', { timeout: 5000 });
    console.log('📄 Survey intro page loaded');

    // Take screenshot of intro
    await page.screenshot({ path: './survey-intro.png' });
    console.log('📸 Screenshot saved: survey-intro.png');

    // Click the "시작하기" button
    console.log('🎬 Clicking "시작하기" button...');
    await page.click('button:has-text("시작하기")');

    // Wait for world cup page to load (wait for celebrity images)
    console.log('⏳ Waiting for world cup tournament page...');
    await page.waitForSelector('img', { timeout: 10000 });

    // Wait a bit for images to load
    await page.waitForTimeout(2000);

    // Take screenshot of world cup page
    await page.screenshot({ path: './survey-worldcup.png' });
    console.log('📸 Screenshot saved: survey-worldcup.png');

    // Check images loaded
    const images = await page.locator('img').all();
    console.log(`🖼️  Found ${images.length} images on page`);

    // Get details of first few images
    for (let i = 0; i < Math.min(4, images.length); i++) {
      const src = await images[i].getAttribute('src');
      const alt = await images[i].getAttribute('alt');
      const naturalWidth = await images[i].evaluate(img => img.naturalWidth);
      const naturalHeight = await images[i].evaluate(img => img.naturalHeight);
      console.log(`  Image ${i + 1}: src="${src}" alt="${alt}" size=${naturalWidth}x${naturalHeight}`);
    }

    // Check page title/content
    const title = await page.locator('h2').first().textContent();
    console.log(`✨ Page title: ${title}`);

    console.log('\n✅ Survey world cup page verification PASSED');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: './survey-error.png' });
    console.log('📸 Error screenshot saved: survey-error.png');
    process.exit(1);
  } finally {
    await context.close();
    await browser.close();
  }
}

testSurveyImages().catch(err => {
  console.error(err);
  process.exit(1);
});
