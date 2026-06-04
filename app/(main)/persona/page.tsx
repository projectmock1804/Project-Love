"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";

interface PersonaData {
  conflict_style?: string;
  communication_tone?: string;
  life_priority?: string[];
  date_style?: string;
  emotion_expression?: string;
  five_year_vision?: string;
  humor_style?: string;
  stress_relief?: string;
  personality_keywords?: string[];
  likes?: string[];
  dislikes?: string[];
  summary?: string;
  [key: string]: unknown;
}

export default function PersonaPage() {
  const router = useRouter();
  useRequireAuth();
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [appearanceWinner, setAppearanceWinner] = useState<{
    id?: string; name?: string; imageUrl?: string; faceShape?: string;
  } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadPersona();
  }, []);

  async function loadPersona() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/persona", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPersona(data.persona.summaryJson as PersonaData);
        if (data.appearanceWinner) {
          setAppearanceWinner(data.appearanceWinner);
        }
        // AI 이미지 생성 비동기로 시작
        if (token) generateAIImage(token);
      } else {
        setError("페르소나를 불러올 수 없습니다.");
      }
    } catch {
      setError("페르소나를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function generateAIImage(token: string) {
    try {
      setGeneratingImage(true);
      const res = await fetch("/api/appearance-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) setGeneratedImage(data.imageUrl);
      }
    } catch (e) {
      console.error("AI 이미지 생성 실패:", e);
    } finally {
      setGeneratingImage(false);
    }
  }

  async function confirmPersona() {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/persona", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          summaryJson: persona,
          userFeedback: feedback || undefined, // 피드백 포함
        }),
      });
      if (res.ok) {
        router.push("/matches");
      } else {
        const data = await res.json();
        setError(data.error || "오류가 발생했습니다.");
      }
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  // _failed 페르소나 — 재채팅 강제 유도
  if (!loading && persona?._failed === true) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">페르소나 생성에 실패했습니다</h2>
          <p className="text-stone-500 text-sm mb-6">
            AI가 대화를 충분히 분석하지 못했어요. AI와 다시 대화해주세요.
          </p>
          <button
            onClick={() => router.push("/chat")}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition"
          >
            다시 대화하기
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">페르소나 불러오는 중...</p>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">아직 페르소나가 없어요</h2>
          <p className="text-stone-500 text-sm mb-6">
            AI와 대화를 완료하면 페르소나가 만들어져요.
          </p>
          <button
            onClick={() => router.push("/chat")}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition"
          >
            AI와 대화하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">당신의 페르소나</h1>
            <p className="text-stone-500 text-sm mt-1">AI가 대화를 분석해서 만들었어요. 잘 맞나요?</p>
          </div>
          <LogoutButton />
        </div>

        {/* 이상형 이미지 섹션 */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">👁️ 당신의 이상형</p>
          <div className="grid grid-cols-2 gap-3">
            {/* 월드컵 우승 연예인 */}
            {appearanceWinner?.imageUrl && (
              <div className="bg-white rounded-xl overflow-hidden shadow border border-stone-100">
                <div className="relative w-full aspect-[3/4]">
                  <Image
                    src={appearanceWinner.imageUrl}
                    alt={appearanceWinner.name ?? "이상형"}
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-semibold">{appearanceWinner.name}</p>
                    <p className="text-white/60 text-xs">선택한 외모</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI 생성 이미지 */}
            <div className="bg-white rounded-xl overflow-hidden shadow border border-stone-100">
              {generatingImage ? (
                <div className="aspect-[3/4] flex flex-col items-center justify-center bg-stone-50 animate-pulse gap-2">
                  <div className="text-2xl">✨</div>
                  <p className="text-xs text-stone-400 text-center px-2">AI가 이상형<br/>이미지 생성 중...</p>
                </div>
              ) : generatedImage ? (
                <div className="relative w-full aspect-[3/4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generatedImage}
                    alt="AI 생성 이상형"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-semibold">AI 생성</p>
                    <p className="text-white/60 text-xs">설문 기반 이미지</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] flex flex-col items-center justify-center bg-stone-50 gap-2">
                  <p className="text-xs text-stone-400 text-center px-2">이미지 생성<br/>실패</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {persona.summary && (
          <div className="bg-stone-900 text-white rounded-2xl p-6 mb-4">
            <p className="text-sm leading-relaxed">{persona.summary}</p>
          </div>
        )}

        <div className="space-y-3">
          {persona.personality_keywords && persona.personality_keywords.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">성격 키워드</p>
              <div className="flex flex-wrap gap-2">
                {persona.personality_keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-stone-100 rounded-full text-sm text-stone-700">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {persona.conflict_style && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">갈등 처리</p>
              <p className="text-stone-800">{persona.conflict_style}</p>
            </div>
          )}

          {persona.communication_tone && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">대화 스타일</p>
              <p className="text-stone-800">{persona.communication_tone}</p>
            </div>
          )}

          {persona.five_year_vision && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">5년 뒤 비전</p>
              <p className="text-stone-800">{persona.five_year_vision}</p>
            </div>
          )}

          {persona.date_style && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">데이트 스타일</p>
              <p className="text-stone-800">{persona.date_style}</p>
            </div>
          )}

          {persona.likes && persona.likes.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">좋아하는 것</p>
              <div className="flex flex-wrap gap-2">
                {persona.likes.map((like, i) => (
                  <span key={i} className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">{like}</span>
                ))}
              </div>
            </div>
          )}

          {persona.dislikes && persona.dislikes.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">싫어하는 것</p>
              <div className="flex flex-wrap gap-2">
                {persona.dislikes.map((dislike, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 border border-red-200 rounded-full text-sm text-red-700">{dislike}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">
              💬 코멘트 추가 (선택)
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="페르소나에 대한 의견을 자유롭게 작성해주세요. 예: '더 추가하고 싶은 부분이 있나요?', '이 부분은 틀렸어요' 등"
              className="w-full p-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-500 resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-stone-400 mt-1">
              {feedback.length}/500
            </p>
          </div>

          <p className="text-center text-sm text-stone-500">
            이 페르소나가 당신을 잘 표현하나요?
          </p>
          <button
            onClick={confirmPersona}
            disabled={saving}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition disabled:opacity-40"
          >
            {saving ? "저장 중..." : "맞아요, 매칭 시작하기"}
          </button>
          <button
            onClick={() => router.push("/chat")}
            className="w-full py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition"
          >
            다시 만들기 (AI와 재대화)
          </button>
        </div>
      </div>
    </div>
  );
}
