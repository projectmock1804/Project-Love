import { chromium } from '@playwright/test';

const maleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXBwNWhwdm0wMDAxbjhnY3dmOTRzcjlsIiwiaWF0IjoxNzc5OTUyMDQ3LCJleHAiOjE3ODI1NDQwNDd9.9Qa3l3U4CAd_onKmAnkzqIMlPNo4VV1-kZnybQCm7MQ";

async function diagnose() {
  let browser;
  try {
    console.log('🔍 네트워크 요청 진단 시작...\n');
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // 네트워크 요청 로깅
    page.on('response', response => {
      const url = response.url();
      if (url.includes('celebrities') || url.includes('images')) {
        console.log(`${response.status()} ${url}`);
      }
    });

    page.on('requestfailed', request => {
      console.log(`❌ FAILED: ${request.url()}`);
    });

    // 콘솔 에러 로깅
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 [ERROR] ${msg.text()}`);
      }
    });

    // Set token
    await page.goto('http://localhost:3000/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, maleToken);

    console.log('📖 Survey 페이지 로드...\n');
    await page.goto('http://localhost:3000/survey', { waitUntil: 'networkidle' });

    // Wait for intro
    await page.waitForSelector('button', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click start
    console.log('🎬 "시작하기" 클릭...\n');
    const startButton = await page.locator('button').first();
    await startButton.click();

    // Wait and capture network
    console.log('⏳ 월드컵 페이지 로드 중... (네트워크 요청 감시)\n');
    await page.waitForTimeout(3000);

    // Check what images actually loaded
    const images = await page.locator('img').all();
    console.log(`\n📋 실제 로드된 IMG 태그: ${images.length}개\n`);

    for (let i = 0; i < images.length; i++) {
      const src = await images[i].getAttribute('src');
      const currentSrc = await images[i].evaluate(img => img.currentSrc);
      const complete = await images[i].evaluate(img => img.complete);
      const naturalWidth = await images[i].evaluate(img => img.naturalWidth);

      console.log(`📌 이미지 ${i + 1}:`);
      console.log(`   src attribute: ${src}`);
      console.log(`   currentSrc: ${currentSrc}`);
      console.log(`   complete: ${complete}`);
      console.log(`   naturalWidth: ${naturalWidth}`);
      console.log(`   로드됨: ${complete && naturalWidth > 0 ? '✅ YES' : '❌ NO'}\n`);
    }

    // Check SurveyWorldCup component
    console.log('📌 페이지 구조 확인:');
    const pageTitle = await page.locator('h2').first().textContent();
    console.log(`   페이지 제목: ${pageTitle}`);

    // HTML 스냅샷
    console.log('\n📌 HTML 스냅샷 (img 태그들):');
    const html = await page.content();
    const imgMatches = html.match(/<img[^>]*src="[^"]*celebrities[^"]*"[^>]*>/g);
    if (imgMatches) {
      imgMatches.slice(0, 3).forEach((tag, i) => {
        console.log(`   ${i + 1}. ${tag.substring(0, 100)}...`);
      });
    } else {
      console.log('   ❌ HTML에 celebrities 이미지 태그 없음!');
    }

    await browser.close();

  } catch (error) {
    console.error('\n❌ 진단 실패:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

diagnose();
