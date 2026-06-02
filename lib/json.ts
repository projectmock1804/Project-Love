/**
 * LLM 응답에서 JSON 객체를 안전하게 추출한다.
 * DeepSeek 등은 ```json 펜스나 앞뒤 설명 텍스트를 붙이는 경우가 많아
 * 단순 JSON.parse는 자주 실패한다. 첫 '{' ~ 마지막 '}' 구간을 잘라 파싱한다.
 */
export function extractJson<T = unknown>(raw: string): T | null {
  if (!raw) return null;

  let cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // fence 제거로 안 되면 첫 { 부터 마지막 } 까지 추출
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  cleaned = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
