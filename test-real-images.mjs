import { chromium } from '@playwright/test';

const maleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXBwNWhwdm0wMDAxbjhnY3dmOTRzcjlsIiwiaWF0IjoxNzc5OTUyMDQ3LCJleHAiOjE3ODI1NDQwNDd9.9Qa3l3U4CAd_onKmAnkzqIMlPNo4VV1-kZnybQCm7MQ";

async function testRealImages() {
  let browser;
  try {
    console.log('🌐 실제 이미지 테스트 - 남자 유저 접속...\n');
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Set token
    await page.goto('http://localhost:3000/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, maleToken);

    console.log('📖 survey 페이지 로드...');
    await page.goto('http://localhost:3000/survey', { waitUntil: 'networkidle' });

    // Wait for intro
    await page.waitForSelector('button', { timeout: 10000 });
    await page.waitForTimeout(1000);
    console.log('✅ 인트로 페이지 로드됨\n');

    // Click start
    console.log('🎬 "시작하기" 클릭...');
    const startButton = await page.locator('button').first();
    await startButton.click();

    // Wait for world cup
    console.log('⏳ 월드컵 페이지 로드 중...');
    await page.waitForSelector('img', { timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✅ 월드컵 페이지 로드됨\n');

    // Get images
    const images = await page.locator('img').all();
    console.log(`📷 이미지 개수: ${images.length}개\n`);

    console.log('🖼️  이미지 상세정보:');
    for (let i = 0; i < Math.min(2, images.length); i++) {
      const src = await images[i].getAttribute('src');
      const complete = await images[i].evaluate(img => img.complete);
      const naturalWidth = await images[i].evaluate(img => img.naturalWidth);
      const naturalHeight = await images[i].evaluate(img => img.naturalHeight);

      console.log(`\n  이미지 ${i + 1}:`);
      console.log(`    경로: ${src}`);
      console.log(`    로드됨: ${complete ? '✅ YES' : '❌ NO'}`);
      console.log(`    크기: ${naturalWidth}x${naturalHeight}px`);

      // JPG vs SVG 판단
      if (src.includes('.jpg')) {
        console.log(`    타입: 📸 실제 사진 (JPG)`);
      } else if (src.includes('.svg')) {
        console.log(`    타입: 🎨 벡터 (SVG - 그라디언트)`);
      }
    }

    // Take screenshot
    console.log('\n📸 스크린샷 저장...');
    await page.screenshot({ path: 'screenshots/real-images-test.png' });
    console.log('   ✅ Saved to: screenshots/real-images-test.png');

    console.log('\n✅ 테스트 완료!');
    console.log('   여자 연예인 실제 사진이 표시되었나요?');

    await browser.close();

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

testRealImages();
