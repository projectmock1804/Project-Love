import { chat } from "./openrouter";
import { extractJson } from "./json";

export interface ScoreBreakdown {
  values_alignment: { score: number; reason: string };
  communication_fit: { score: number; reason: string };
  lifestyle_match: { score: number; reason: string };
  future_vision: { score: number; reason: string };
}

export interface CompatibilityResult {
  compatibilityScore: number;
  breakdown: ScoreBreakdown;
  degraded: boolean;
}

export interface SimulationTurn {
  speaker: "A" | "B";
  text: string;
}

/** survey.ageRange 값에 따라 상대 나이 허용 여부 */
export function ageAcceptable(myAge: number, myRange: string, theirAge: number): boolean {
  const diff = Math.abs(myAge - theirAge);
  switch (myRange) {
    case "동갑만":
      return diff === 0;
    case "±3세":
      return diff <= 3;
    case "±5세":
      return diff <= 5;
    case "±10세":
      return diff <= 10;
    case "상관없음":
      return true;
    default:
      return diff <= 5;
  }
}

const COMPAT_SYSTEM = `당신은 두 사람의 연애 호환도를 분석하는 전문가입니다.
두 페르소나 JSON을 보고 4개 카테고리를 각각 0~100으로 평가하세요.
점수는 근거에 기반해야 하며, 한 줄 이유를 한국어로 작성하세요.

반드시 아래 형식의 유효한 JSON만 출력하세요 (마크다운/설명 금지):
{
  "values_alignment": { "score": 0-100, "reason": "가치관 합치도 근거 한 줄" },
  "communication_fit": { "score": 0-100, "reason": "대화 스타일 합치 근거 한 줄" },
  "lifestyle_match": { "score": 0-100, "reason": "생활 패턴 근거 한 줄" },
  "future_vision": { "score": 0-100, "reason": "미래 비전 근거 한 줄" }
}`;

export async function computeCompatibility(
  personaA: unknown,
  personaB: unknown
): Promise<CompatibilityResult> {
  const userContent = `[페르소나 A]\n${JSON.stringify(personaA)}\n\n[페르소나 B]\n${JSON.stringify(personaB)}`;

  const raw = await chat(
    [
      { role: "system", content: COMPAT_SYSTEM },
      { role: "user", content: userContent },
    ],
    { maxTokens: 600, temperature: 0.3 }
  );

  let degraded = false;
  let parsed = extractJson<ScoreBreakdown>(raw);
  if (!parsed) {
    const retry = await chat(
      [
        { role: "system", content: COMPAT_SYSTEM + "\n\n유효한 JSON 객체만 출력. 다른 텍스트 절대 금지." },
        { role: "user", content: userContent },
      ],
      { maxTokens: 600, temperature: 0.1 }
    );
    parsed = extractJson<ScoreBreakdown>(retry);
  }

  if (!parsed) {
    // LLM 파싱 2회 실패 → 중립 점수 폴백. degraded 표시로 호출부가 가짜 점수 저장을 막게 함
    degraded = true;
    const neutral = { score: 50, reason: "분석 데이터 부족" };
    parsed = {
      values_alignment: neutral,
      communication_fit: neutral,
      lifestyle_match: neutral,
      future_vision: neutral,
    };
  }

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n || 0)));
  const breakdown: ScoreBreakdown = {
    values_alignment: { score: clamp(parsed.values_alignment?.score), reason: parsed.values_alignment?.reason || "" },
    communication_fit: { score: clamp(parsed.communication_fit?.score), reason: parsed.communication_fit?.reason || "" },
    lifestyle_match: { score: clamp(parsed.lifestyle_match?.score), reason: parsed.lifestyle_match?.reason || "" },
    future_vision: { score: clamp(parsed.future_vision?.score), reason: parsed.future_vision?.reason || "" },
  };

  // 가치관/미래비전에 가중치 (진지한 만남 서비스 → 장기 합치도 중시)
  const compatibilityScore = Math.round(
    breakdown.values_alignment.score * 0.3 +
      breakdown.communication_fit.score * 0.2 +
      breakdown.lifestyle_match.score * 0.2 +
      breakdown.future_vision.score * 0.3
  );

  return { compatibilityScore, breakdown, degraded };
}

const SIM_SYSTEM = `당신은 두 사람의 첫 대화를 시뮬레이션합니다.
아래 두 페르소나의 성격/말투/가치관을 반영해서, 처음 만난 두 사람이 나눌 법한
자연스러운 대화를 4~5회 왕복으로 생성하세요.

규칙:
- 각 페르소나의 communication_tone, humor_style을 말투에 반영
- 실제 사람처럼 자연스럽게 (딱딱한 인터뷰 금지)
- 연락처, SNS, 실명 등 개인정보는 절대 등장시키지 마세요
- 첫 메시지는 A가 시작

반드시 아래 형식의 유효한 JSON 배열만 출력하세요 (마크다운/설명 금지):
[
  { "speaker": "A", "text": "..." },
  { "speaker": "B", "text": "..." }
]`;

export async function runSimulation(
  personaA: unknown,
  personaB: unknown
): Promise<SimulationTurn[]> {
  const userContent = `[페르소나 A]\n${JSON.stringify(personaA)}\n\n[페르소나 B]\n${JSON.stringify(personaB)}`;

  const raw = await chat(
    [
      { role: "system", content: SIM_SYSTEM },
      { role: "user", content: userContent },
    ],
    { maxTokens: 2500, temperature: 0.8 }
  );

  let parsed = extractJsonArray(raw);
  if (!parsed) {
    // 잘린 응답 등으로 파싱 실패 시 1회 재시도. 그래도 실패면 빈 배열(호출부가 길이로 판단)
    const retry = await chat(
      [
        { role: "system", content: SIM_SYSTEM },
        { role: "user", content: userContent },
      ],
      { maxTokens: 2500, temperature: 0.8 }
    );
    parsed = extractJsonArray(retry);
  }
  if (!parsed) return [];

  return parsed
    .filter(
      (t): t is SimulationTurn =>
        t != null &&
        (t.speaker === "A" || t.speaker === "B") &&
        typeof t.text === "string"
    )
    .slice(0, 6);
}

function extractJsonArray(raw: string): SimulationTurn[] | null {
  if (!raw) return null;
  let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    const v = JSON.parse(cleaned);
    if (Array.isArray(v)) return v;
  } catch {
    // fall through
  }

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  cleaned = cleaned.slice(start, end + 1);
  try {
    const v = JSON.parse(cleaned);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}
