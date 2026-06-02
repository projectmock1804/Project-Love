import { chromium } from '@playwright/test';
import https from 'https';
import fs from 'fs';
import path from 'path';

const imageDir = path.join(process.cwd(), 'public/images/celebrities');

const femaleArtists = [
  '아일릿 원희',
  '김고은',
  '아일릿 민주',
  '한소희',
  '박민영',
  '정호연',
  '송혜교',
  '트와이스 사나',
  '트와이스 지효',
  '엔믹스 설윤',
  '하츠투하츠 에이나',
  '하츠투하츠 이안',
  '하츠투하츠 유하',
  '리센느 제나',
  '리센느 미나미',
  '고윤정',
];

function downloadImage(url, filepath) {
  return new Promise((resolve) => {
    try {
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          resolve(false);
          return;
        }
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      }).on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

async function downloadFemaleImages() {
  let browser;
  try {
    console.log('🌐 여자 연예인 이미지 다운로드 시작...\n');

    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--no-sandbox']
    });

    let successCount = 0;

    for (let i = 0; i < femaleArtists.length; i++) {
      const name = femaleArtists[i];
      const index = i + 1;

      console.log(`[${index}/16] ${name} 다운로드 중...`);

      try {
        const page = await browser.newPage();

        // 구글 이미지 검색
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(name)}&tbm=isch`, {
          waitUntil: 'networkidle'
        });

        // 첫 번째 이미지 클릭
        await page.waitForSelector('img[alt]', { timeout: 5000 });
        const images = await page.locator('img[alt]').all();

        if (images.length > 0) {
          await images[0].click();
          await page.waitForTimeout(500);

          // 이미지 URL 추출
          const imageUrls = await page.locator('img.n3VNCb').all();

          for (const imgElement of imageUrls) {
            try {
              const src = await imgElement.getAttribute('src');
              if (src && (src.startsWith('http') || src.startsWith('data:image'))) {
                const filename = `female_${index}.jpg`;
                const filepath = path.join(imageDir, filename);

                // 실제 이미지 URL인 경우만 다운로드
                if (src.startsWith('http')) {
                  const success = await downloadImage(src, filepath);
                  if (success) {
                    console.log(`  ✅ ${filename} 저장됨\n`);
                    successCount++;
                    break;
                  }
                }
              }
            } catch (e) {
              // 계속
            }
          }
        }

        await page.close();
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`  ⚠️  실패: ${error.message}\n`);
      }
    }

    console.log(`\n✅ 완료! ${successCount}/16 성공\n`);
    console.log(`저장 위치: ${imageDir}`);

    await browser.close();

  } catch (error) {
    console.error('❌ 에러:', error);
    if (browser) await browser.close();
  }
}

downloadFemaleImages();
