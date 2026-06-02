import { chromium } from '@playwright/test';

const maleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXBwNWhwdm0wMDAxbjhnY3dmOTRzcjlsIiwiaWF0IjoxNzc5OTUyMDQ3LCJleHAiOjE3ODI1NDQwNDd9.9Qa3l3U4CAd_onKmAnkzqIMlPNo4VV1-kZnybQCm7MQ";

async function testMaleUser() {
  let browser;
  try {
    console.log('🌐 Male User Test - Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Set male user token in localStorage
    await page.goto('http://localhost:3000/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, maleToken);

    console.log('📖 남자 유저로 survey 페이지 접속...');
    await page.goto('http://localhost:3000/survey', { waitUntil: 'networkidle' });

    // Wait for intro page
    console.log('⏳ Waiting for intro page...');
    await page.waitForSelector('button', { timeout: 10000 });
    await page.waitForTimeout(1000);
    console.log('✅ Intro page loaded');

    // Click start button
    console.log('🎬 "시작하기" 클릭...');
    const startButton = await page.locator('button').first();
    await startButton.click();

    // Wait for world cup page
    console.log('⏳ 월드컵 페이지 로딩 중...');
    await page.waitForSelector('img', { timeout: 10000 });
    await page.waitForTimeout(1000);
    console.log('✅ World cup page loaded');

    // Take screenshot
    console.log('📸 스크린샷 저장 중...');
    await page.screenshot({ path: 'screenshots/male-user-worldcup.png' });
    console.log('   ✅ Saved to: screenshots/male-user-worldcup.png');

    // Get image details
    const images = await page.locator('img').all();
    console.log(`\n🖼️  이미지 개수: ${images.length}개`);

    console.log('\n📋 이미지 상세정보:');
    for (let i = 0; i < Math.min(2, images.length); i++) {
      const src = await images[i].getAttribute('src');
      const alt = await images[i].getAttribute('alt');
      console.log(`  이미지 ${i + 1}: ${src}`);

      // 이미지 경로에서 gender 추출
      if (src.includes('female')) {
        console.log(`    ✅ 여자 연예인 (female)`);
      } else if (src.includes('male')) {
        console.log(`    ❌ 남자 연예인 (male) - 오류!`);
      }
    }

    // Get page title
    const title = await page.locator('h2').first().textContent();
    console.log(`\n✨ 페이지 섹션: ${title}`);

    console.log('\n✅ 남자 유저 테스트 완료!');
    console.log('   남자 유저는 여자 연예인을 봐야 합니다.');

    await browser.close();

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

testMaleUser();
