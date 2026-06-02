"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import SurveyWorldCup from "@/components/SurveyWorldCup";
import SurveyPersonality from "@/components/SurveyPersonality";
import SurveyLifestyle from "@/components/SurveyLifestyle";
import SurveyBodyFeatures from "@/components/SurveyBodyFeatures";
import {
  getAppearanceCelebrities,
  getBodyFeatures,
  PERSONALITY_SCENARIOS,
  LIFESTYLE_ACTIVITIES,
  Celebrity,
} from "@/lib/newSurveyQuestions";

type SurveySection = "intro" | "world_cup" | "personality" | "lifestyle" | "body" | "complete";

interface SurveyResponses {
  appearance_winner?: {
    id: string;
    name: string;
    imageUrl?: string;
    faceShape?: string;
  };
  appearance_scores?: Record<string, number>;
  appearance_all_choices?: Array<{ id: string; name: string }>;
  personality: Record<string, string>;
  lifestyle?: string;
  body_features?: Record<string, number>;
  age_range?: string; // 나이 선호도 — match/run에서 ageAcceptable 필터에 사용
}

export default function SurveyPage() {
  const router = useRouter();
  useRequireAuth();

  const [section, setSection] = useState<SurveySection>("intro");
  const [userGender, setUserGender] = useState<string>("");      // 빈 문자열 = 로딩 중
  const [genderLoaded, setGenderLoaded] = useState(false);       // 로딩 완료 게이트
  const [responses, setResponses] = useState<SurveyResponses>({
    personality: {},
    body_features: {},
    age_range: "±5세",  // 기본값
  });
  const [currentPersonalityIdx, setCurrentPersonalityIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 사용자 정보 로드 — 완료 전 월드컵 진입 차단
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        // localStorage의 캐시 user 데이터를 먼저 사용 (race condition 방지)
        const cached = localStorage.getItem("user");
        if (cached) {
          try {
            const u = JSON.parse(cached);
            if (u.gender) { setUserGender(u.gender); setGenderLoaded(true); }
          } catch { /* 파싱 실패 시 무시 */ }
        }
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserGender(data.gender);
        }
      } catch {
        console.error("Failed to load user info");
      } finally {
        setGenderLoaded(true); // 실패해도 게이트 해제 (기본값으로 진행)
      }
    };
    loadUserInfo();
  }, []);

  // gender가 비어있으면 안전한 기본값으로 폴백 (데드락 방지)
  const resolvedGender = userGender || "male";

  const getProgress = () => {
    const sections: SurveySection[] = ["world_cup", "personality", "lifestyle", "body"];
    const completed = sections.filter((s) => {
      if (s === "world_cup") return !!responses.appearance_winner;
      if (s === "personality")
        return Object.keys(responses.personality).length === PERSONALITY_SCENARIOS.length;
      if (s === "lifestyle") return !!responses.lifestyle;
      if (s === "body")
        return Object.keys(responses.body_features || {}).length === getBodyFeatures(resolvedGender).length;
      return false;
    }).length;
    return Math.round((completed / sections.length) * 100);
  };

  const handleWorldCupComplete = (winner: Celebrity, scores: Record<string, number>, allChoices: Celebrity[]) => {
    setResponses((prev) => ({
      ...prev,
      appearance_winner: {
        id: winner.id,
        name: winner.name,
        imageUrl: winner.imageUrl,
        faceShape: winner.faceShape,
      },
      appearance_scores: scores,
      appearance_all_choices: allChoices.map(c => ({ id: c.id, name: c.name })), // 모든 선택 저장
    }));
    setSection("personality");
  };

  const handlePersonalitySelect = (value: string) => {
    const scenario = PERSONALITY_SCENARIOS[currentPersonalityIdx];
    setResponses((prev) => ({
      ...prev,
      personality: {
        ...prev.personality,
        [scenario.id]: value,
      },
    }));

    if (currentPersonalityIdx < PERSONALITY_SCENARIOS.length - 1) {
      setCurrentPersonalityIdx(currentPersonalityIdx + 1);
    } else {
      setSection("lifestyle");
      setCurrentPersonalityIdx(0);
    }
  };

  const handleLifestyleSelect = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      lifestyle: value,
    }));
    setSection("body");
  };

  const handleBodyFeatureUpdate = (featureId: string, value: number) => {
    setResponses((prev) => ({
      ...prev,
      body_features: {
        ...(prev.body_features || {}),
        [featureId]: value,
      },
    }));
  };

  const isBodyFeaturesComplete =
    Object.keys(responses.body_features || {}).length === getBodyFeatures(resolvedGender).length;

  async function handleFinalSubmit() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          responses: {
            ...responses,
            user_gender: userGender,
          },
        }),
      });

      if (res.ok) {
        router.push("/chat");
      } else {
        const data = await res.json();
        setError(data.error || "설문 저장 실패");
      }
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const handleBack = () => {
    if (section === "personality") setSection("world_cup");
    else if (section === "lifestyle") {
      setCurrentPersonalityIdx(0); // 마지막이 아닌 첫 질문으로 (UX 혼란 방지)
      setSection("personality");
    } else if (section === "body") setSection("lifestyle");
    // world_cup: 이전 버튼 숨김 처리 (아래 Navigation에서)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Progress Bar */}
      {section !== "intro" && section !== "complete" && (
        <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-slate-900">
                {section === "world_cup" && "👁️ 이상형 월드컵"}
                {section === "personality" && "💭 성격 시나리오"}
                {section === "lifestyle" && "🎯 라이프스타일"}
                {section === "body" && "📏 신체 특성"}
              </h1>
              <span className="text-sm font-medium text-slate-600">{getProgress()}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {section === "intro" && (
          <div className="max-w-lg mx-auto space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="text-5xl mb-4">💝</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">이상형 파악 설문</h2>
              <p className="text-slate-500 text-sm">소요 시간 약 5~10분</p>
            </div>

            {/* 왜 해야 하나 */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-bold text-amber-900 mb-3">✋ 시작 전 꼭 읽어주세요</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                좋은 소개팅의 첫걸음은 <strong>내 이상형을 정확히 아는 것</strong>입니다.
                많은 분들이 &ldquo;조건은 별로 없어요&rdquo;라고 하지만, 막상 만나보면 끌리는 사람이 따로 있죠.
                <br /><br />
                이 설문은 <strong>당신도 몰랐던 이상형</strong>을 끌어내기 위해 설계됐습니다.
                귀찮더라도 솔직하게 답할수록, AI가 더 잘 맞는 상대를 찾아드립니다.
              </p>
            </div>

            {/* 구성 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900">설문 구성</h3>
              {[
                { icon: "👁️", title: "이상형 월드컵", desc: "16명 중 가장 끌리는 외모를 골라요 (16강 토너먼트)" },
                { icon: "💭", title: "성격 시나리오", desc: "실제 상황에서 내 반응 패턴을 파악해요" },
                { icon: "🎯", title: "라이프스타일", desc: "나의 주말 스타일과 삶의 방식" },
                { icon: "📏", title: "이상형 조건", desc: "키, 체형, 외적 조건 선호도" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSection("world_cup")}
              disabled={!genderLoaded}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {genderLoaded ? "시작하기 →" : "로딩 중..."}
            </button>
          </div>
        )}

        {section === "world_cup" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">👁️ 이상형 월드컵</h2>
              <p className="text-slate-600">당신이 가장 끌리는 얼굴형을 선택해주세요</p>
            </div>
            <SurveyWorldCup
              celebrities={getAppearanceCelebrities(resolvedGender)}
              onComplete={handleWorldCupComplete}
            />
          </div>
        )}

        {section === "personality" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">💭 성격 시나리오</h2>
              <p className="text-slate-600">
                현실적인 상황에서 당신이라면 어떻게 반응할까요?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {currentPersonalityIdx + 1} / {PERSONALITY_SCENARIOS.length}
              </p>
            </div>
            <SurveyPersonality
              scenario={PERSONALITY_SCENARIOS[currentPersonalityIdx]}
              onSelect={handlePersonalitySelect}
              selected={responses.personality[PERSONALITY_SCENARIOS[currentPersonalityIdx].id]}
            />
          </div>
        )}

        {section === "lifestyle" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">🎯 라이프스타일</h2>
              <p className="text-slate-600">주말에 가장 즐겨 하는 활동은?</p>
            </div>
            <SurveyLifestyle
              cards={LIFESTYLE_ACTIVITIES}
              onSelect={handleLifestyleSelect}
              selected={responses.lifestyle}
            />
          </div>
        )}

        {section === "body" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">📏 신체 특성 & 나이 선호</h2>
              <p className="text-slate-600">이상형의 특성을 선택해주세요</p>
            </div>

            {/* 나이 선호도 선택 */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">나이 차이 선호</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {(["동갑만", "±3세", "±5세", "±10세", "상관없음"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setResponses(r => ({ ...r, age_range: opt }))}
                    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                      responses.age_range === opt
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <SurveyBodyFeatures
              features={getBodyFeatures(resolvedGender)}
              onUpdate={handleBodyFeatureUpdate}
              responses={responses.body_features || {}}
            />
          </div>
        )}

        {section === "complete" && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">설문 완료!</h2>
            <p className="text-lg text-slate-600 mb-8">
              이제 AI와 깊이 있는 대화를 통해
              <br />
              당신의 진정한 페르소나를 만들어볼게요 🚀
            </p>
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-lg disabled:opacity-50"
            >
              {loading ? "저장 중..." : "AI 채팅 시작하기"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Navigation */}
        {section !== "intro" && section !== "complete" && (
          <div className="mt-8 flex gap-3">
            {/* world_cup 에선 "이전" 숨김 — 토너먼트 중간 되돌리기 불가 */}
            {section !== "world_cup" && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                ← 이전
              </button>
            )}
            <button
              onClick={() => {
                setError("");
                if (section === "world_cup") {
                  if (!responses.appearance_winner) {
                    setError("이상형을 선택해주세요");
                    return;
                  }
                } else if (section === "personality") {
                  if (Object.keys(responses.personality).length !== PERSONALITY_SCENARIOS.length) {
                    setError("모든 시나리오에 답변해주세요");
                    return;
                  }
                } else if (section === "lifestyle") {
                  if (!responses.lifestyle) {
                    setError("라이프스타일을 선택해주세요");
                    return;
                  }
                } else if (section === "body") {
                  if (!isBodyFeaturesComplete) {
                    setError("모든 신체 특성을 선택해주세요");
                    return;
                  }
                  setSection("complete");
                  return;
                }

                if (section === "world_cup") setSection("personality");
                else if (section === "personality") setSection("lifestyle");
                else if (section === "lifestyle") setSection("body");
              }}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              {section === "body" ? "완료 →" : "다음 →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
