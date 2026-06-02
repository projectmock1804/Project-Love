import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic();

const celebrities = [
  { id: 1, name: "아일릿 원희" },
  { id: 2, name: "김고은" },
  { id: 3, name: "아일릿 민주" },
  { id: 4, name: "한소희" },
  { id: 5, name: "박민영" },
  { id: 6, name: "정호연" },
  { id: 7, name: "송혜교" },
  { id: 8, name: "트와이스 사나" },
  { id: 9, name: "트와이스 지효" },
  { id: 10, name: "엔믹스 설윤" },
  { id: 11, name: "하츠투하츠 에이나" },
  { id: 12, name: "하츠투하츠 이안" },
  { id: 13, name: "하츠투하츠 유하" },
  { id: 14, name: "리센느 제나" },
  { id: 15, name: "리센느 미나미" },
  { id: 16, name: "고윤정" },
];

async function analyzeCelebrity(id, name) {
  const imagePath = path.join(
    process.cwd(),
    `public/images/celebrities/female_${id}.jpg`
  );

  if (!fs.existsSync(imagePath)) {
    console.log(`⚠️  [${id}/16] ${name} - 이미지 파일 없음`);
    return null;
  }

  try {
    console.log(`🔍 [${id}/16] ${name} 분석 중...`);

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `이 사진의 여성을 분석해서 다음을 JSON 형식으로 답해줘 (한국어):
{
  "faceShape": "oval|heart|round|square|long 중 하나",
  "skinTone": "밝음|중간|어두움",
  "eyeShape": "큰 눈|중간|작은 눈",
  "lipStyle": "내추럴|볼드|글로시 중 주요 스타일",
  "makeupStyle": "내추럴|글래머러스|시크|프레시 중 주요 스타일",
  "primaryVibes": ["우아함", "신비로움", "청순함", "발랄함", "강렬함", "친근함", "고급스러움", "여유로움" 중 3개],
  "styleCategory": "K-idol|K-drama배우|걸그룹|솔로가수|기타",
  "skinCondition": "맑음|윤기있음|매트|기타",
  "overallImpression": "한 문장 설명"
}

정확하게 분석해줘.`,
            },
          ],
        },
      ],
    });

    const analysisText = response.content[0].text;
    const analysis = JSON.parse(analysisText);

    console.log(`  ✅ ${name} 분석 완료`);
    return {
      id,
      name,
      features: analysis,
    };
  } catch (error) {
    console.error(`  ❌ ${name} 분석 실패:`, error.message);
    return null;
  }
}

async function analyzeAll() {
  console.log("=" * 50);
  console.log("🎬 여자 연예인 16명 분석 시작\n");

  const results = [];

  for (const celebrity of celebrities) {
    const result = await analyzeCelebrity(celebrity.id, celebrity.name);
    if (result) {
      results.push(result);
    }
    // API rate limit 대비 딜레이
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 결과 저장
  const outputPath = path.join(process.cwd(), "celebrity-analysis.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n" + "=" * 50);
  console.log(`✅ 분석 완료! ${results.length}/16`);
  console.log(`📁 결과 저장: ${outputPath}`);
}

analyzeAll().catch(console.error);
