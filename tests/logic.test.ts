import { describe, it, expect } from "vitest";
import { ageAcceptable } from "../lib/matching";
import { extractJson } from "../lib/json";

describe("ageAcceptable", () => {
  it("동갑만 - 같은 나이만 허용", () => {
    expect(ageAcceptable(30, "동갑만", 30)).toBe(true);
    expect(ageAcceptable(30, "동갑만", 31)).toBe(false);
  });

  it("±3세 - 3살 차이까지 허용", () => {
    expect(ageAcceptable(30, "±3세", 33)).toBe(true);
    expect(ageAcceptable(30, "±3세", 34)).toBe(false);
    expect(ageAcceptable(30, "±3세", 27)).toBe(true);
  });

  it("±5세 / ±10세 경계값", () => {
    expect(ageAcceptable(30, "±5세", 35)).toBe(true);
    expect(ageAcceptable(30, "±5세", 36)).toBe(false);
    expect(ageAcceptable(30, "±10세", 40)).toBe(true);
    expect(ageAcceptable(30, "±10세", 41)).toBe(false);
  });

  it("상관없음 - 항상 허용", () => {
    expect(ageAcceptable(25, "상관없음", 60)).toBe(true);
  });

  it("알 수 없는 값 - ±5세로 폴백", () => {
    expect(ageAcceptable(30, "unknown", 34)).toBe(true);
    expect(ageAcceptable(30, "unknown", 40)).toBe(false);
  });
});

describe("extractJson", () => {
  it("순수 JSON 파싱", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("```json 코드펜스 제거", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("앞뒤 설명 텍스트가 있어도 객체 추출", () => {
    const raw = '분석 결과입니다:\n{"score": 86, "reason": "잘 맞아요"}\n감사합니다.';
    expect(extractJson(raw)).toEqual({ score: 86, reason: "잘 맞아요" });
  });

  it("파싱 불가 시 null 반환", () => {
    expect(extractJson("완전히 깨진 응답")).toBeNull();
    expect(extractJson("")).toBeNull();
  });
});
