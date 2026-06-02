import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const REGIONS = ["서울 강남", "서울 홍대", "서울 이태원", "서울 신촌", "서울 성수", "서울 마포", "서울 잠실", "서울 강북", "서울 강서", "서울 노원", "부산", "대구", "인천", "수원", "광주", "대전", "울산", "제주"];

const JOBS = ["개발자", "디자이너", "마케터", "교사", "간호사", "의사", "회계사", "변호사", "PD", "기자", "요리사", "작가", "사진작가", "공무원", "은행원", "영업직", "창업가", "대학원생", "학생", "프리랜서"];

const MALE_PERSONAS = [
  { summary: "책임감 있고 신중한 성격. 일과 삶의 균형을 중요하게 생각하며, 진지한 관계를 원합니다. 주말에는 등산이나 자전거를 즐기며 야외 활동을 좋아합니다.", personality_keywords: ["책임감", "신중함", "성실함"], communication_tone: "직접적이고 솔직하게 표현하는 편. 감정 표현은 서툴지만 행동으로 보여주는 스타일", conflict_style: "갈등을 피하기보다 직접 대화로 해결하려 함", date_style: "맛집 탐방이나 드라이브 선호. 자연 속 여행을 특히 좋아함", likes: ["등산", "자전거", "요리", "축구"], dislikes: ["거짓말", "의존적인 관계"] },
  { summary: "감성적이고 예술적인 취향. 음악과 영화를 사랑하며, 깊이 있는 대화를 즐기는 사람입니다. 내향적이지만 믿음직한 성격.", personality_keywords: ["감성적", "창의적", "내향적"], communication_tone: "신중하게 말하는 편. 글로 감정 표현하는 것을 더 편하게 느낌", conflict_style: "감정이 격해지면 혼자 시간을 갖고 정리 후 대화", date_style: "전시회, 공연, 독립영화 선호. 조용한 카페에서 대화하는 시간을 좋아함", likes: ["음악", "영화", "미술관", "글쓰기"], dislikes: ["얕은 대화", "소란스러운 환경"] },
  { summary: "활발하고 사교적인 성격. 새로운 사람 만나기를 즐기며 유머 감각이 뛰어납니다. 함께 있으면 에너지를 주는 타입.", personality_keywords: ["활발함", "유머", "사교성"], communication_tone: "유머를 섞어 가볍게 표현하는 편. 분위기 메이커", conflict_style: "갈등을 유머로 풀려 하는 편. 분위기 환기를 잘 함", date_style: "친구들과 함께하는 모임, 파티, 활동적인 데이트 선호", likes: ["파티", "게임", "여행", "스포츠"], dislikes: ["지나친 진지함", "고집스러운 태도"] },
  { summary: "안정적이고 가족 중심적인 가치관. 장기적인 관계와 결혼을 진지하게 생각하는 사람입니다.", personality_keywords: ["안정감", "가족 지향", "헌신"], communication_tone: "따뜻하고 배려심 있는 표현 방식. 상대의 기분을 먼저 생각함", conflict_style: "갈등 시 상대 입장을 먼저 들으려 노력함", date_style: "홈쿡, 함께 요리, 동네 산책 등 일상적인 데이트를 더 소중히 생각", likes: ["요리", "가족", "반려동물", "드라마"], dislikes: ["불안정성", "자기 중심적 태도"] },
  { summary: "지적 호기심이 강하고 성장 지향적. IT 분야에서 일하며 새로운 기술과 트렌드에 관심이 많습니다.", personality_keywords: ["지적", "성장 지향", "분석적"], communication_tone: "논리적이고 명확하게 표현함. 때로는 직설적으로 느껴질 수 있음", conflict_style: "문제의 원인을 분석하고 해결책을 찾으려 함", date_style: "새로운 레스토랑, 기술 박람회, 해외 여행 선호", likes: ["독서", "코딩", "여행", "테크"], dislikes: ["비효율", "근거 없는 감정적 판단"] },
];

const FEMALE_PERSONAS = [
  { summary: "따뜻하고 공감 능력이 뛰어난 성격. 주변 사람들을 잘 챙기며, 진솔한 관계를 소중히 여깁니다. 카페와 독서를 좋아합니다.", personality_keywords: ["따뜻함", "공감", "배려"], communication_tone: "감정을 솔직하게 표현하는 편. 상대의 감정 변화에 예민하게 반응함", conflict_style: "갈등 상황에서 감정을 먼저 표현하고 대화로 해결하려 함", date_style: "감성적인 카페, 함께 요리, 야경 드라이브 선호", likes: ["독서", "카페", "꽃", "사진", "영화"], dislikes: ["무관심", "거짓말"] },
  { summary: "독립적이고 커리어 지향적. 자신의 일을 사랑하며, 서로 발전할 수 있는 관계를 원합니다. 여행과 새로운 경험을 즐깁니다.", personality_keywords: ["독립적", "목표 지향", "자신감"], communication_tone: "직접적이고 자신감 있는 표현 방식. 원하는 것을 명확히 말하는 편", conflict_style: "갈등을 회피하지 않고 직접 해결하려 함", date_style: "해외여행, 전시회, 파인다이닝 등 특별한 경험 선호", likes: ["여행", "미술", "와인", "요가"], dislikes: ["의존적 태도", "발전 없는 관계"] },
  { summary: "유쾌하고 긍정적인 에너지. 어떤 상황에서도 밝게 바라보며, 함께 있으면 기분 좋아지는 사람입니다.", personality_keywords: ["긍정적", "밝음", "유머"], communication_tone: "밝고 유머러스한 표현 방식. 상대를 자주 웃게 만드는 편", conflict_style: "갈등을 가볍게 만들려 하지만 필요할 땐 솔직하게 말함", date_style: "놀이공원, 야구 경기, 맛집 탐방 등 신나는 데이트 선호", likes: ["K-pop", "영화", "맛집", "스포츠 관람"], dislikes: ["부정적 에너지", "지나친 심각함"] },
  { summary: "감수성이 풍부하고 예술적 취향. 음악과 미술을 사랑하며, 조용하고 의미 있는 시간을 소중히 여깁니다.", personality_keywords: ["감수성", "예술적", "내향적"], communication_tone: "감정을 섬세하게 표현함. 글이나 음악으로 감정을 전달하기도 함", conflict_style: "혼자 감정을 정리한 후 차분하게 대화하는 편", date_style: "재즈 바, 전시회, 독립 서점, 조용한 카페 선호", likes: ["재즈", "그림", "영화", "요가", "글쓰기"], dislikes: ["소란스러운 환경", "감정 무시"] },
  { summary: "실용적이고 계획적인 성격. 미래에 대한 명확한 비전이 있으며, 서로 신뢰하고 존중하는 관계를 원합니다.", personality_keywords: ["실용적", "계획적", "신뢰"], communication_tone: "논리적이면서도 배려 있게 표현함. 상대의 의견도 충분히 듣는 편", conflict_style: "문제를 감정이 아닌 사실 위주로 해결하려 함", date_style: "계획된 여행, 갤러리 투어, 건강한 식사 선호", likes: ["여행 계획", "재테크", "독서", "필라테스"], dislikes: ["무계획", "책임감 없는 행동"] },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSurveyResponses(gender: string) {
  const faceShapes = ["oval", "round", "square", "heart", "long"];
  const lifestyles = ["home", "nature", "culture", "social", "hobby"];
  const personalityAnswers = {
    conflict_1: randomFrom(["understanding", "slightly_annoyed", "direct", "humorous"]),
    emotion_1: randomFrom(["open", "reserved", "humorous_deflect", "needs_space"]),
    value_1: randomFrom(["career_first", "balance", "relationship_first", "conflicted"]),
    communication_1: randomFrom(["immediate_apology", "clarify", "deep_apology"]),
    lifestyle_1: randomFrom(["active", "cozy", "cultural", "social", "flexible"]),
  };

  return {
    appearance_winner: {
      id: `face_f_${Math.floor(Math.random() * 16) + 1}`,
      faceShape: randomFrom(faceShapes),
    },
    appearance_scores: Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [`face_f_${i + 1}`, Math.floor(Math.random() * 4) + 2])
    ),
    personality: personalityAnswers,
    lifestyle: randomFrom(lifestyles),
    body_features: {
      height_male: gender === "female" ? 170 + Math.floor(Math.random() * 16) : 158 + Math.floor(Math.random() * 12),
      weight: Math.floor(Math.random() * 6) + 3,
      physique: Math.floor(Math.random() * 6) + 3,
      skin_tone: Math.floor(Math.random() * 5) + 3,
    },
    user_gender: gender,
  };
}

async function main() {
  console.log("Seeding 500 test profiles...");

  // 기존 테스트 데이터 삭제 (외래키 순서 준수)
  const testUsers = await prisma.user.findMany({ where: { email: { endsWith: "@example.com" } }, select: { id: true } });
  const testIds = testUsers.map(u => u.id);
  if (testIds.length > 0) {
    await prisma.payment.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.message.deleteMany({ where: { senderId: { in: testIds } } });
    await prisma.match.deleteMany({ where: { OR: [{ user1Id: { in: testIds } }, { user2Id: { in: testIds } }] } });
    await prisma.persona.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.survey.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.chatSession.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.user.deleteMany({ where: { id: { in: testIds } } });
    console.log(`Cleaned up ${testIds.length} existing test profiles`);
  }

  const password = await bcrypt.hash("password123", 10);

  for (let i = 1; i <= 500; i++) {
    const gender = i % 2 === 0 ? "female" : "male";
    const age = 23 + (i % 15);
    const region = randomFrom(REGIONS);
    const job = randomFrom(JOBS);

    const persona = gender === "male"
      ? MALE_PERSONAS[i % MALE_PERSONAS.length]
      : FEMALE_PERSONAS[i % FEMALE_PERSONAS.length];

    const enrichedPersona = {
      ...persona,
      job,
      age,
      region,
      five_year_vision: ["안정적인 커리어와 가정", "글로벌 여행과 경험", "창업 성공", "전문가로 성장"][i % 4],
      marriage_view: ["3~5년 내 결혼 희망", "인연이 되면 자연스럽게", "지금은 진지한 연애 먼저", "아직 생각 없음"][i % 4],
      contact_frequency: ["매일 연락 선호", "하루 2~3번", "자유롭게", "너무 잦은 연락은 부담"][i % 4],
      stress_relief: ["운동", "독서", "음악 감상", "친구와 대화", "혼자 시간"][i % 5],
    };

    try {
      const user = await prisma.user.create({
        data: {
          email: `test${i}@example.com`,
          passwordHash: password,
          name: `${gender === "male" ? "테스트남" : "테스트여"}${i}`,
          gender,
          age,
          region,
          status: "active",
        },
      });

      await prisma.survey.create({
        data: {
          userId: user.id,
          responses: generateSurveyResponses(gender),
        },
      });

      await prisma.persona.create({
        data: {
          userId: user.id,
          summaryJson: enrichedPersona as object,
          userConfirmed: true,
        },
      });

      if (i % 50 === 0) console.log(`Created ${i}/500 profiles...`);
    } catch (e) {
      console.log(`Skipped ${i} (already exists)`);
    }
  }

  const count = await prisma.user.count();
  console.log(`Done! Total users in DB: ${count}`);
}

main()
  .catch((e) => { console.error("Seeding failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
