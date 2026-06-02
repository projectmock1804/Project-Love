"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LogoutButton from "@/components/LogoutButton";

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
      } else {
        setError("페르소나를 불러올 수 없습니다.");
      }
    } catch {
      setError("페르소나를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ summaryJson: persona }),
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

        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-stone-500">이 페르소나가 당신을 잘 표현하나요?</p>
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
