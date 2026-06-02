"use client";

import { useState } from "react";
import { Celebrity } from "@/lib/newSurveyQuestions";

interface WorldCupProps {
  celebrities: Celebrity[];
  onComplete: (winner: Celebrity, scores: Record<string, number>, allChoices: Celebrity[]) => void;
  title: string;
}

const SCALE_OPTIONS = [
  { value: 1, label: "별로야", emoji: "😬" },
  { value: 2, label: "그저 그래", emoji: "😐" },
  { value: 3, label: "괜찮아", emoji: "🙂" },
  { value: 4, label: "좋아!", emoji: "😍" },
  { value: 5, label: "최고야!", emoji: "🔥" },
];

export default function SurveyWorldCup({ celebrities, onComplete, title }: WorldCupProps) {
  // 16명을 셔플해서 시작 — Fisher-Yates (통계적 편향 없음)
  const [rounds] = useState<Celebrity[][]>(() => {
    const shuffled = [...celebrities];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // 2명씩 짝 지음: [[A,B],[C,D],...]
    const pairs: Celebrity[][] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      pairs.push([shuffled[i], shuffled[i + 1]]);
    }
    return pairs;
  });

  const [matchIdx, setMatchIdx] = useState(0);          // 현재 라운드 내 매치 인덱스
  const [roundWinners, setRoundWinners] = useState<Celebrity[]>([]); // 이번 라운드 승자들
  const [currentPairs, setCurrentPairs] = useState(rounds); // 현재 라운드 매치 목록
  const [roundNum, setRoundNum] = useState(0);           // 0=16강, 1=8강, 2=4강, 3=결승
  const [scores, setScores] = useState<Record<string, number>>({}); // 전체 평가 점수
  const [pendingWinner, setPendingWinner] = useState<Celebrity | null>(null); // 선택된 승자 (평가 대기)
  const [showScale, setShowScale] = useState(false);    // 스케일 평가 화면 표시
  const [allChoices, setAllChoices] = useState<Celebrity[]>([]); // 모든 라운드의 모든 선택

  const ROUND_NAMES = ["16강", "8강", "4강", "결승"];
  const totalMatches = currentPairs.length;
  const currentPair = currentPairs[matchIdx];

  // 한 명 선택 → 스케일 평가 화면 표시
  function handlePick(winner: Celebrity) {
    setPendingWinner(winner);
    setShowScale(true);
  }

  // 스케일 평가 후 다음 매치로
  function handleScaleSelect(score: number) {
    if (!pendingWinner) return;

    const newScores = { ...scores, [pendingWinner.id]: score };
    setScores(newScores);

    const newWinners = [...roundWinners, pendingWinner];
    const newAllChoices = [...allChoices, pendingWinner]; // 모든 선택에 추가
    setAllChoices(newAllChoices);

    // 마지막 매치였나?
    if (matchIdx + 1 >= currentPairs.length) {
      // 이번 라운드 끝 — 다음 라운드 준비
      if (newWinners.length === 1) {
        // 최종 우승자!
        onComplete(newWinners[0], newScores, newAllChoices);
        return;
      }
      // 다음 라운드 페어 구성
      const nextPairs: Celebrity[][] = [];
      for (let i = 0; i < newWinners.length; i += 2) {
        nextPairs.push([newWinners[i], newWinners[i + 1]]);
      }
      setCurrentPairs(nextPairs);
      setRoundNum(r => r + 1);
      setMatchIdx(0);
      setRoundWinners([]);
    } else {
      setMatchIdx(i => i + 1);
      setRoundWinners(newWinners);
    }

    setPendingWinner(null);
    setShowScale(false);
  }

  // 스케일 평가 스킵
  function handleSkipScale() {
    handleScaleSelect(3); // 기본값 3점
  }

  if (!currentPair || currentPair.length < 2) return null;

  const [left, right] = currentPair;

  // ── 스케일 평가 화면 ──
  if (showScale && pendingWinner) {
    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <p className="text-sm text-slate-500 mb-1">{ROUND_NAMES[roundNum]} · {matchIdx + 1}/{totalMatches}</p>
          <h3 className="text-xl font-bold text-slate-900">선택했어요! 얼마나 마음에 들어요?</h3>
        </div>

        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-indigo-500 shadow-lg">
            <img
              src={pendingWinner.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleScaleSelect(opt.value)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition"
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span className="text-xs text-slate-600 text-center leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>

        <button onClick={handleSkipScale} className="w-full text-sm text-slate-400 hover:text-slate-600 py-2">
          건너뛰기
        </button>
      </div>
    );
  }

  // ── 토너먼트 매치 화면 ──
  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-bold px-4 py-1 rounded-full">
          {ROUND_NAMES[roundNum]}
        </span>
        <p className="text-sm text-slate-500 mt-2">
          {matchIdx + 1} / {totalMatches} 경기
        </p>
      </div>

      {/* 진행 바 */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${(matchIdx / totalMatches) * 100}%` }}
        />
      </div>

      <div className="relative flex gap-3 items-stretch">
        {/* 왼쪽 카드 */}
        <button
          onClick={() => handlePick(left)}
          className="flex-1 group overflow-hidden rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="aspect-[3/4] relative overflow-hidden bg-slate-200">
            <img
              src={left.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          {/* 카드 하단: 실명 제거, 직관적 선택 유도 */}
          <div className="py-3 px-2 bg-white group-hover:bg-indigo-50 transition text-center">
            <p className="text-xs text-slate-400 font-medium">이 인상이 더 끌려요</p>
          </div>
        </button>

        {/* VS 배지 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 shadow flex items-center justify-center">
            <span className="text-xs font-black text-slate-600">VS</span>
          </div>
        </div>

        {/* 오른쪽 카드 */}
        <button
          onClick={() => handlePick(right)}
          className="flex-1 group overflow-hidden rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="aspect-[3/4] relative overflow-hidden bg-slate-200">
            <img
              src={right.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div className="py-3 px-2 bg-white group-hover:bg-indigo-50 transition text-center">
            <p className="text-xs text-slate-400 font-medium">이 인상이 더 끌려요</p>
          </div>
        </button>
      </div>

      <p className="text-center text-sm text-slate-400 mt-4">더 끌리는 쪽을 선택하세요</p>
    </div>
  );
}
