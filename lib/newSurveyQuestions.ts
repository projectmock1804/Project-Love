// 이상형 월드컵용 연예인 정보
export interface Celebrity {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  faceShape?: string;
}

// 성격 질문 - 상황 기반
export interface PersonalityScenario {
  id: string;
  scenario: string;
  context: string;
  options: Array<{
    value: string;
    message: string;
    description: string;
  }>;
}

// 신체 특성 슬라이더
export interface BodyFeatureQuestion {
  id: string;
  feature: string;
  scale: string;
  min: number;
  max: number;
}

// 라이프스타일 이미지 카드
export interface LifestyleCard {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  value: string;
}

// ===== 이상형 월드컵 데이터 (16강 = 16명) =====
export const APPEARANCE_CELEBRITIES_FEMALE: Celebrity[] = [
  { id: "face_f_1",  name: "아일릿 원희",     imageUrl: `/images/celebrities/female_1.jpg`,  description: "아일릿 원희",       faceShape: "oval"   },
  { id: "face_f_2",  name: "김고은",         imageUrl: `/images/celebrities/female_2.jpg`,  description: "김고은",       faceShape: "heart"  },
  { id: "face_f_3",  name: "아일릿 민주",     imageUrl: `/images/celebrities/female_3.jpg`,  description: "아일릿 민주",           faceShape: "round"  },
  { id: "face_f_4",  name: "한소희",         imageUrl: `/images/celebrities/female_4.jpg`,  description: "한소희",     faceShape: "long"   },
  { id: "face_f_5",  name: "박민영",         imageUrl: `/images/celebrities/female_5.jpg`,  description: "박민영",   faceShape: "oval"   },
  { id: "face_f_6",  name: "정호연",         imageUrl: `/images/celebrities/female_6.jpg`,  description: "정호연",     faceShape: "square" },
  { id: "face_f_7",  name: "송혜교",         imageUrl: `/images/celebrities/female_7.jpg`,  description: "송혜교",   faceShape: "oval"   },
  { id: "face_f_8",  name: "트와이스 사나",    imageUrl: `/images/celebrities/female_8.jpg`,  description: "트와이스 사나",   faceShape: "heart"  },
  { id: "face_f_9",  name: "트와이스 지효",    imageUrl: `/images/celebrities/female_9.jpg`,  description: "트와이스 지효",   faceShape: "long"   },
  { id: "face_f_10", name: "엔믹스 설윤",     imageUrl: `/images/celebrities/female_10.jpg`, description: "엔믹스 설윤",       faceShape: "oval"   },
  { id: "face_f_11", name: "하츠투하츠 에이나", imageUrl: `/images/celebrities/female_11.jpg`, description: "하츠투하츠 에이나",   faceShape: "square" },
  { id: "face_f_12", name: "하츠투하츠 이안",  imageUrl: `/images/celebrities/female_12.jpg`, description: "하츠투하츠 이안",   faceShape: "round"  },
  { id: "face_f_13", name: "하츠투하츠 유하",  imageUrl: `/images/celebrities/female_13.jpg`, description: "하츠투하츠 유하",       faceShape: "oval"   },
  { id: "face_f_14", name: "리센느 제나",     imageUrl: `/images/celebrities/female_14.jpg`, description: "리센느 제나",       faceShape: "heart"  },
  { id: "face_f_15", name: "리센느 미나미",    imageUrl: `/images/celebrities/female_15.jpg`, description: "리센느 미나미",     faceShape: "long"   },
  { id: "face_f_16", name: "고윤정",         imageUrl: `/images/celebrities/female_16.jpg`, description: "고윤정",       faceShape: "oval"   },
];

export const APPEARANCE_CELEBRITIES_MALE: Celebrity[] = [
  { id: "face_m_1",  name: "차은우",      imageUrl: `/images/celebrities/male_1.jpg`,  description: "차은우",         faceShape: "oval"   },
  { id: "face_m_2",  name: "박서준",      imageUrl: `/images/celebrities/male_2.jpg`,  description: "박서준",     faceShape: "square" },
  { id: "face_m_3",  name: "이민호",      imageUrl: `/images/celebrities/male_3.jpg`,  description: "이민호",       faceShape: "long"   },
  { id: "face_m_4",  name: "이동욱",      imageUrl: `/images/celebrities/male_4.jpg`,  description: "이동욱",     faceShape: "oval"   },
  { id: "face_m_5",  name: "송강",        imageUrl: `/images/celebrities/male_5.jpg`,    description: "송강",       faceShape: "heart"  },
  { id: "face_m_6",  name: "로운",        imageUrl: `/images/celebrities/male_6.jpg`,    description: "로운",       faceShape: "square" },
  { id: "face_m_7",  name: "남주혁",      imageUrl: `/images/celebrities/male_7.jpg`,  description: "남주혁",           faceShape: "oval"   },
  { id: "face_m_8",  name: "디오",        imageUrl: `/images/celebrities/male_8.jpg`,    description: "디오",     faceShape: "round"  },
  { id: "face_m_9",  name: "세훈",        imageUrl: `/images/celebrities/male_9.jpg`,    description: "세훈",       faceShape: "long"   },
  { id: "face_m_10", name: "뷔",          imageUrl: `/images/celebrities/male_10.jpg`,      description: "뷔",   faceShape: "square" },
  { id: "face_m_11", name: "정국",        imageUrl: `/images/celebrities/male_11.jpg`,    description: "정국",     faceShape: "round"  },
  { id: "face_m_12", name: "제이크",      imageUrl: `/images/celebrities/male_12.jpg`,  description: "제이크",       faceShape: "heart"  },
  { id: "face_m_13", name: "범규",        imageUrl: `/images/celebrities/male_13.jpg`,    description: "범규",     faceShape: "oval"   },
  { id: "face_m_14", name: "원식",        imageUrl: `/images/celebrities/male_14.jpg`,    description: "원식", faceShape: "round"  },
  { id: "face_m_15", name: "희승",        imageUrl: `/images/celebrities/male_15.jpg`,    description: "희승",     faceShape: "long"   },
  { id: "face_m_16", name: "화영",        imageUrl: `/images/celebrities/male_16.jpg`,    description: "화영",       faceShape: "square" },
];

export function getAppearanceCelebrities(userGender: string): Celebrity[] {
  return userGender === "male"
    ? APPEARANCE_CELEBRITIES_FEMALE
    : APPEARANCE_CELEBRITIES_MALE;
}

// ===== 성격 - 상황 기반 질문 =====
export const PERSONALITY_SCENARIOS: PersonalityScenario[] = [
  {
    id: "conflict_1",
    scenario: "당신과 약속 시간에 상대가 갑자기 30분 늦는다고 연락한다",
    context: "처음 만날 때 상황",
    options: [
      { value: "understanding",    message: "괜찮아, 급한 일 있었나 봐. 천천히 와 😊",                     description: "이해심 있게 받아주는 스타일" },
      { value: "slightly_annoyed", message: "음... 괜찮긴 한데 미리 알려줄 수 있으면 좋아",               description: "약간 아쉽지만 말을 아끼는 스타일" },
      { value: "direct",           message: "30분은 좀 길지 않나? 뭐가 있었어?",                          description: "직설적으로 표현하는 스타일" },
      { value: "frustrated",       message: "이게 뭐하는 건데. 다시 약속 잡자",                           description: "짜증을 명확히 드러내는 스타일" },
      { value: "humorous",         message: "어? 혹시 내 날씨에 와버렸나? 😂",                            description: "유머로 넘어가는 스타일" },
    ],
  },
  {
    id: "emotion_1",
    scenario: "당신이 기분 안 좋은 날, 상대가 물어본다",
    context: "연락 후 잠시 후 대화 중",
    options: [
      { value: "open",             message: "응.. 요즘 일이 좀 많아서. 들어줄래?",                        description: "솔직하게 마음을 열어주는 스타일" },
      { value: "reserved",         message: "괜찮아, 그냥 피곤한 것 같아",                               description: "조심스럽게 말하는 스타일" },
      { value: "humorous_deflect", message: "아 이건 비밀, 넌 좋은 일만 들어야 해 😄",                   description: "농담으로 돌리는 스타일" },
      { value: "needs_space",      message: "지금은 혼자 있고 싶어, 미안해",                             description: "솔직하게 필요한 것을 표현하는 스타일" },
      { value: "vague",            message: "그냥 뭐... 별로 안 좋네",                                   description: "자세히 말하지 않는 스타일" },
    ],
  },
  {
    id: "value_1",
    scenario: "경력 기회와 연인과의 시간 사이에서 선택해야 할 때",
    context: "중요한 프로젝트 vs 예정된 여행",
    options: [
      { value: "career_first",     message: "미안해, 이 기회가 정말 중요해. 다음으로 미뤄도 괜찮아?",    description: "일을 우선시하는 스타일" },
      { value: "balance",          message: "흠... 고민이 많네. 뭐 우리 함께 할 수 있는 방법이 있을까?", description: "함께 해결책을 찾는 스타일" },
      { value: "relationship_first", message: "음.. 이미 약속한 거니까 이건 포기할 수 없어",             description: "관계를 우선시하는 스타일" },
      { value: "conflicted",       message: "어... 이거 정말 힘든데. 시간을 줄 수 있어?",               description: "고민하고 소통하는 스타일" },
    ],
  },
  {
    id: "communication_1",
    scenario: "당신이 한 말로 상대가 상처받은 것 같을 때",
    context: "농담으로 한 말인데 반응이 좋지 않음",
    options: [
      { value: "immediate_apology", message: "앗, 미안해! 그런 뜻이 아니었어. 상처 줘서 정말 죄송해",   description: "빠르게 사과하는 스타일" },
      { value: "clarify",          message: "어? 내가 농담으로 한 건데... 내 뜻이 잘못 전달된 거 같네",  description: "의도를 설명하는 스타일" },
      { value: "dismissive",       message: "그냥 농담이잖아, 왜 이렇게 예민해?",                       description: "농담으로 넘어가려는 스타일" },
      { value: "deep_apology",     message: "진짜 미안해... 내가 너무 무신경했어. 어떻게 하면 기분 풀어줄 수 있을까?", description: "깊이 있게 사과하는 스타일" },
    ],
  },
  {
    id: "lifestyle_1",
    scenario: "주말을 어떻게 보낼지 정할 때",
    context: "둘 다 자유로운 날씨",
    options: [
      { value: "active",    message: "어디 재미있는 데 가볼까? 산이나 카페?",              description: "밖으로 나가는 것을 좋아하는 스타일" },
      { value: "cozy",      message: "그냥 집에서 편히 시간 보내면 안 될까?",             description: "집에서 편하게 보내기를 원하는 스타일" },
      { value: "cultural",  message: "이번 주에 좋은 영화 개봉했어, 보러 갈래?",         description: "문화생활을 즐기는 스타일" },
      { value: "social",    message: "우리 친구들 만나서 같이 놀아, 재미있을 거야",       description: "사람 만나는 것을 좋아하는 스타일" },
      { value: "flexible",  message: "뭐든 괜찮은데 너는 뭐 하고 싶어?",                 description: "상대에 맞추는 유동적인 스타일" },
    ],
  },
];

// ===== 라이프스타일 이미지 카드 =====
export const LIFESTYLE_ACTIVITIES: LifestyleCard[] = [
  { id: "weekend_home",    title: "집에서 휴식",   imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", description: "영화, 책, 게임으로 편한 시간",    value: "home"    },
  { id: "weekend_nature",  title: "자연 활동",     imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", description: "등산, 캠핑, 야외 활동",          value: "nature"  },
  { id: "weekend_culture", title: "문화생활",      imageUrl: "https://images.unsplash.com/photo-1524712245610-34a88e5fc9e1?w=400", description: "영화, 전시, 공연, 뮤지컬",       value: "culture" },
  { id: "weekend_social",  title: "사람 만나기",   imageUrl: "https://images.unsplash.com/photo-1523438097911-512782515f6f?w=400", description: "친구들과 모임, 파티, 카페",      value: "social"  },
  { id: "weekend_hobby",   title: "취미 활동",     imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400", description: "운동, 음악, 미술, 요리",         value: "hobby"   },
];

// ===== 신체 특성 슬라이더 (이상형 기준) =====
// 남성 유저 → 여성 이상형 기준, 여성 유저 → 남성 이상형 기준
export const BODY_FEATURES_MALE_IDEAL: BodyFeatureQuestion[] = [
  { id: "height",    feature: "키",      scale: "155cm - 172cm",   min: 155, max: 172 },
  { id: "weight",    feature: "몸무게",  scale: "슬림 - 통통",     min: 1,   max: 10  },
  { id: "physique",  feature: "체형",    scale: "마른 체형 - 글래머", min: 1, max: 10 },
  { id: "skin_tone", feature: "피부톤",  scale: "밝은톤 - 어두운톤", min: 1, max: 10 },
];

export const BODY_FEATURES_FEMALE_IDEAL: BodyFeatureQuestion[] = [
  { id: "height",    feature: "키",      scale: "165cm - 185cm",     min: 165, max: 185 },
  { id: "weight",    feature: "몸무게",  scale: "슬림 - 통통",       min: 1,   max: 10  },
  { id: "physique",  feature: "체형",    scale: "마른 체형 - 근육질", min: 1,  max: 10  },
  { id: "skin_tone", feature: "피부톤",  scale: "밝은톤 - 어두운톤",  min: 1,  max: 10  },
];

/** userGender 기반으로 이상형 슬라이더 반환 */
export function getBodyFeatures(userGender: string): BodyFeatureQuestion[] {
  return userGender === "male" ? BODY_FEATURES_MALE_IDEAL : BODY_FEATURES_FEMALE_IDEAL;
}

// 하위호환 — 기존 코드가 BODY_FEATURES를 직접 import하는 경우를 위한 alias
export const BODY_FEATURES = BODY_FEATURES_FEMALE_IDEAL;
