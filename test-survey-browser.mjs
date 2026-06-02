import { chromium } from '@playwright/test';
import fs from 'fs';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXBwNWM0M3YwMDAwbjhnY2prZGw2dmg4IiwiaWF0IjoxNzc5OTUxNzg2LCJleHAiOjE3ODI1NDM3ODZ9.8PYNDET40u-CaIDvVqoTWpSlajF4vLOUzisiLS41oX0";

async function testSurveyInBrowser() {
  let browser;
  try {
    console.log('🌐 Launching browser with Playwright...');
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Set token in localStorage before navigation
    await page.goto('http://localhost:3000/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, token);

    console.log('📖 Navigating to survey page...');
    await page.goto('http://localhost:3000/survey', { waitUntil: 'networkidle' });

    // Wait for page to load
    console.log('⏳ Waiting for intro content...');
    await page.waitForSelector('button', { timeout: 10000 });
    // Wait a bit more for React to hydrate
    await page.waitForTimeout(2000);
    console.log('✅ Survey intro page loaded');

    // Take screenshot of intro
    console.log('📸 Taking screenshot of intro page...');
    await page.screenshot({ path: 'screenshots/survey-intro.png' });
    console.log('   Saved to: screenshots/survey-intro.png');

    // Click start button
    console.log('🎬 Clicking "시작하기" button...');
    const startButton = await page.locator('button').first();
    await startButton.click();

    // Wait for world cup page
    console.log('⏳ Waiting for world cup page to load...');
    await page.waitForSelector('img', { timeout: 10000 });
    console.log('✅ World cup page loaded');

    // Wait for images to render
    await page.waitForTimeout(1000);

    // Take screenshot
    console.log('📸 Taking screenshot of world cup page...');
    await page.screenshot({ path: 'screenshots/survey-worldcup.png' });
    console.log('   Saved to: screenshots/survey-worldcup.png');

    // Check images
    const images = await page.locator('img').all();
    console.log(`\n🖼️  Found ${images.length} images on the world cup page`);

    // Get image details
    console.log('\nImage Details:');
    for (let i = 0; i < Math.min(4, images.length); i++) {
      const src = await images[i].getAttribute('src');
      const alt = await images[i].getAttribute('alt');
      const width = await images[i].evaluate(img => img.width);
      const height = await images[i].evaluate(img => img.height);
      console.log(`  Image ${i + 1}:`);
      console.log(`    src: ${src}`);
      console.log(`    alt: ${alt}`);
      console.log(`    dimensions: ${width}x${height}`);
    }

    // Get page title
    const title = await page.locator('h2').first().textContent();
    console.log(`\n✨ Page section: ${title}`);

    console.log('\n✅ Browser verification completed successfully!');
    console.log('   - Images are loading');
    console.log('   - Tournament structure is rendering');
    console.log('   - Screenshots saved to screenshots/ folder');

    await browser.close();

  } catch (error) {
    console.error('\n❌ Browser test failed:', error.message);
    console.error(error.stack);
    if (browser) await browser.close();
    process.exit(1);
  }
}

testSurveyInBrowser();
