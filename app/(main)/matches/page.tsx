"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LogoutButton from "@/components/LogoutButton";

interface Breakdown {
  values_alignment: { score: number; reason: string };
  communication_fit: { score: number; reason: string };
  lifestyle_match: { score: number; reason: string };
  future_vision: { score: number; reason: string };
}

interface SimTurn {
  speaker: "A" | "B";
  text: string;
}

interface MatchItem {
  matchId: string;
  compatibilityScore: number;
  breakdown: Breakdown;
  simulation: SimTurn[];
  other: { name: string; age: number; region: string; personaSummary: string | null };
  myInterest: boolean;
  theirInterest: boolean;
  mutual: boolean;
  unlocked: boolean;
}

const CATEGORY_LABELS: Record<keyof Breakdown, string> = {
  values_alignment: "가치관 합치도",
  communication_fit: "대화 스타일",
  lifestyle_match: "생활 패턴",
  future_vision: "미래 비전",
};

function ScoreBar({ label, score, reason }: { label: string; score: number; reason: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-stone-600">{label}</span>
        <span className="font-semibold text-stone-900">{score}%</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-stone-900 rounded-full" style={{ width: `${score}%` }} />
      </div>
      {reason && <p className="text-xs text-stone-400 mt-1">{reason}</p>}
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  useRequireAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<{
    region: string;
    regionActiveCount: number;
    target: number;
    open: boolean;
  } | null>(null);

  useEffect(() => {
    loadMatches();
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStatus() {
    try {
      const res = await fetch("/api/match/status", { headers: authHeaders() });
      if (res.ok) setStatus(await res.json());
      else setError("상태를 불러올 수 없습니다.");
    } catch {
      setError("상태를 불러오는 중 오류가 발생했습니다.");
    }
  }

  function authHeaders() {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  }

  async function loadMatches() {
    setLoading(true);
    try {
      const res = await fetch("/api/match", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
      } else {
        setError("매칭을 불러올 수 없습니다.");
      }
    } catch {
      setError("매칭을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function runMatching() {
    setRunning(true);
    setNotice("");
    try {
      const res = await fetch("/api/match/run", { method: "POST", headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        if (data.created === 0) {
          setNotice(data.message || "현재 매칭 가능한 상대를 모집 중입니다.");
        }
        await loadMatches();
      } else {
        setNotice(data.error || "매칭 실행 중 오류가 발생했습니다.");
      }
    } catch {
      setNotice("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setRunning(false); // 네트워크 오류 시에도 반드시 해제
    }
  }

  async function expressInterest(matchId: string) {
    try {
      const res = await fetch("/api/match/interest", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ matchId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatches((ms) =>
          ms.map((m) =>
            m.matchId === matchId
              ? { ...m, myInterest: true, theirInterest: data.theirInterest, mutual: data.mutual }
              : m
          )
        );
      } else {
        const data = await res.json();
        setError(data.error || "관심 표시에 실패했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">매칭 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">매칭 결과</h1>
            <p className="text-stone-500 text-sm mt-1">AI가 미리 대화해본 결과예요</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runMatching}
              disabled={running}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition disabled:opacity-40"
            >
              {running ? "분석 중..." : "매칭 찾기"}
            </button>
            <LogoutButton />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
            {notice}
          </div>
        )}

        {matches.length === 0 && status && !status.open && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center mb-4">
            <p className="text-stone-800 font-medium">
              {status.region} 지역에서 좋은 인연을 모으는 중이에요
            </p>
            <p className="text-stone-400 text-xs mt-1">
              충분한 분들이 모이면 가장 잘 맞는 상대를 찾아드릴게요
            </p>
            <div className="mt-5">
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-900 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (status.regionActiveCount / status.target) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-stone-500 mt-2">
                {status.regionActiveCount} / {status.target}명 모집됨
              </p>
            </div>
          </div>
        )}

        {matches.length === 0 && (status?.open || !status) && !notice && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-stone-700 font-medium text-sm">아직 매칭이 없어요</p>
            <p className="text-stone-400 text-xs mt-1 mb-4">위 &quot;매칭 찾기&quot; 버튼을 눌러보세요.</p>
            <button
              onClick={runMatching}
              disabled={running}
              className="px-5 py-2 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition disabled:opacity-40"
            >
              {running ? "분석 중..." : "지금 매칭 찾기"}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((m) => (
            <div key={m.matchId} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {m.other.name} · {m.other.age}세
                    </p>
                    <p className="text-sm text-stone-400">{m.other.region}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-stone-900">{m.compatibilityScore}%</div>
                    <p className="text-xs text-stone-400">호환도</p>
                  </div>
                </div>

                {m.other.personaSummary && (
                  <p className="text-sm text-stone-600 mt-3 leading-relaxed bg-stone-50 rounded-xl p-3">
                    {m.other.personaSummary}
                  </p>
                )}

                <div className="mt-5 space-y-3">
                  {(Object.keys(CATEGORY_LABELS) as (keyof Breakdown)[]).map((key) => (
                    <ScoreBar
                      key={key}
                      label={CATEGORY_LABELS[key]}
                      score={m.breakdown?.[key]?.score ?? 0}
                      reason={m.breakdown?.[key]?.reason ?? ""}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setExpanded(expanded === m.matchId ? null : m.matchId)}
                  className="mt-4 text-sm text-stone-500 underline"
                >
                  {expanded === m.matchId ? "시뮬레이션 접기" : "AI 시뮬레이션 대화 보기"}
                </button>

                {expanded === m.matchId && (
                  <div className="mt-3 bg-stone-50 rounded-xl p-4 space-y-3">
                    {m.simulation && m.simulation.length > 0 ? (
                      m.simulation.map((turn, i) => (
                        <div
                          key={i}
                          className={`flex ${turn.speaker === "A" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                              turn.speaker === "A"
                                ? "bg-stone-900 text-white rounded-br-md"
                                : "bg-white border border-stone-200 text-stone-800 rounded-bl-md"
                            }`}
                          >
                            {turn.text}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-400 text-center">시뮬레이션 데이터가 없습니다.</p>
                    )}
                    <p className="text-xs text-stone-400 text-center pt-1">
                      A = 나의 페르소나 · B = 상대 페르소나
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-100 p-4 bg-stone-50">
                {m.unlocked ? (
                  <button
                    onClick={() => router.push(`/messages?matchId=${m.matchId}`)}
                    className="w-full py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition"
                  >
                    💬 대화하기
                  </button>
                ) : m.mutual ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-amber-600">
                      <span>💛</span><span>서로 관심이 있어요!</span>
                    </div>
                    <button
                      onClick={() => router.push(`/messages?matchId=${m.matchId}`)}
                      className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition"
                    >
                      메시지 잠금 해제 · 10,000원
                    </button>
                  </div>
                ) : m.myInterest ? (
                  <p className="text-center text-sm text-stone-500 py-2">
                    관심을 표현했어요. 상대의 응답을 기다리는 중...
                  </p>
                ) : (
                  <button
                    onClick={() => expressInterest(m.matchId)}
                    className="w-full py-3 border border-stone-300 text-stone-700 rounded-xl font-medium hover:bg-white transition"
                  >
                    관심 있어요
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
