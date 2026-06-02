const axios = require('axios');
const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'public/images/celebrities');

// 여자 연예인 리스트 (사용자 수정 버전)
const femaleArtists = [
  '아일릿 원희',      // female_1
  '김고은',          // female_2
  '아일릿 민주',      // female_3
  '한소희',          // female_4
  '박민영',          // female_5
  '정호연',          // female_6
  '송혜교',          // female_7
  '트와이스 사나',    // female_8
  '트와이스 지효',    // female_9
  '엔믹스 설윤',      // female_10
  '하츠투하츠 에이나', // female_11
  '하츠투하츠 이안',  // female_12
  '하츠투하츠 유하',  // female_13
  '리센느 제나',      // female_14
  '리센느 미나미',    // female_15
  '고윤정',          // female_16
];

async function downloadImage(name, index) {
  try {
    console.log(`[${index}/16] ${name} 검색 중...`);

    // Bing 이미지 검색 API 사용
    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(name)}`;

    // 직접 URL 시도 (고화질 셀러브리티 이미지)
    const imageUrls = [
      `https://source.unsplash.com/400x500/?${encodeURIComponent(name)}`,
    ];

    for (const url of imageUrls) {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 10000,
        });

        const filename = `female_${index}.jpg`;
        const filepath = path.join(imageDir, filename);

        fs.writeFileSync(filepath, response.data);
        console.log(`  ✅ ${filename} 저장됨 (${response.data.length} bytes)\n`);
        return true;
      } catch (e) {
        // 다음 URL 시도
      }
    }

    console.log(`  ⚠️  ${name} 다운로드 실패\n`);
    return false;

  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}\n`);
    return false;
  }
}

async function downloadAll() {
  console.log('🌐 여자 연예인 이미지 다운로드 시작...\n');
  console.log('=' .repeat(50) + '\n');

  let successCount = 0;

  for (let i = 0; i < femaleArtists.length; i++) {
    const success = await downloadImage(femaleArtists[i], i + 1);
    if (success) successCount++;

    // API 레이트 제한 피하기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('=' .repeat(50));
  console.log(`\n✅ 완료! ${successCount}/${femaleArtists.length} 성공\n`);
  console.log(`저장 위치: ${imageDir}`);
}

downloadAll().catch(console.error);
