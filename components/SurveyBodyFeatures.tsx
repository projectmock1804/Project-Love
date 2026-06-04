"use client";

import { useEffect } from "react";
import { BodyFeatureQuestion } from "@/lib/newSurveyQuestions";

interface BodyFeaturesProps {
  features: BodyFeatureQuestion[];
  onUpdate: (feature: string, value: number) => void;
  responses: Record<string, number>;
}

// 슬라이더 값에 따른 시각적 설명 반환
function getVisualLabel(id: string, value: number, isMale: boolean): { label: string; visual: string } {
  if (id === "weight") {
    const labels = ["", "매우 슬림", "슬림", "보통보다 슬림", "보통", "보통", "보통보다 통통", "통통", "통통", "포동포동", "풍만"];
    const visuals = ["", "🦴", "🌿", "🍃", "🙂", "🙂", "😊", "🌸", "🌸", "🍑", "🍎"];
    return { label: labels[value] || "", visual: visuals[value] || "" };
  }
  if (id === "physique") {
    if (isMale) {
      const labels = ["", "매우 마름", "마른편", "슬림핏", "보통", "보통", "약근육", "근육질", "근육질", "헬스남", "보디빌더"];
      const visuals = ["", "🪶", "🌱", "🌿", "🙂", "🙂", "💪", "💪", "🏋️", "🏋️", "🦸"];
      return { label: labels[value] || "", visual: visuals[value] || "" };
    } else {
      const labels = ["", "매우 마름", "마른편", "슬림핏", "보통", "보통", "글래머", "글래머", "볼륨있음", "볼륨있음", "풍만"];
      const visuals = ["", "🪶", "🌱", "🌿", "🙂", "🙂", "🌸", "🌺", "💃", "💃", "👸"];
      return { label: labels[value] || "", visual: visuals[value] || "" };
    }
  }
  if (id === "height") return { label: `${value}cm`, visual: "📏" };
  return { label: `${value}`, visual: "" };
}

// 피부톤 색상 배열 (1~10)
const SKIN_COLORS = [
  "#FDDBB4", // 1 - 매우 밝음
  "#F5C69A", // 2
  "#EBB882", // 3
  "#DFA86A", // 4
  "#C98B52", // 5
  "#B8713E", // 6
  "#A0602F", // 7
  "#8B4F24", // 8
  "#6B3A1A", // 9
  "#4A2410", // 10 - 매우 어두움
];
const SKIN_LABELS = ["", "아주 밝음", "밝음", "밝은편", "보통보다 밝음", "보통", "보통보다 어두움", "어두운편", "어두움", "많이 어두움", "매우 어두움"];

export default function SurveyBodyFeatures({
  features,
  onUpdate,
  responses,
}: BodyFeaturesProps) {
  // 마운트 시 응답에 없는 슬라이더를 기본값(중간값)으로 초기화
  useEffect(() => {
    for (const f of features) {
      if (responses[f.id] === undefined) {
        onUpdate(f.id, Math.floor((f.min + f.max) / 2));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 이 컴포넌트에 전달된 features가 남성용인지 여성용인지 추론
  const isMaleIdeal = features.some(f => f.id === "physique" && f.max === 10 && f.scale?.includes("근육질"));

  return (
    <div className="w-full">
      <div className="space-y-6">
        {features.map((feature) => {
          const val = responses[feature.id] ?? Math.floor((feature.min + feature.max) / 2);
          const isSkinTone = feature.id === "skin_tone";
          const isHeight = feature.id === "height";
          const { label, visual } = getVisualLabel(feature.id, val, isMaleIdeal);

          return (
            <div key={feature.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">{feature.feature}</h3>
                {/* 현재 값 표시 */}
                {isSkinTone ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-slate-300 shadow"
                      style={{ backgroundColor: SKIN_COLORS[val - 1] || SKIN_COLORS[4] }}
                    />
                    <span className="text-sm font-semibold text-slate-700">{SKIN_LABELS[val]}</span>
                  </div>
                ) : isHeight ? (
                  <span className="text-xl font-bold text-indigo-600">{val}cm</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{visual}</span>
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                  </div>
                )}
              </div>

              {/* 피부톤 전용: 컬러 팔레트 */}
              {isSkinTone ? (
                <div>
                  <div className="flex gap-1 mb-3 justify-between">
                    {SKIN_COLORS.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => onUpdate(feature.id, i + 1)}
                        className="flex-1 rounded-lg transition-all"
                        style={{
                          backgroundColor: color,
                          height: 36,
                          border: val === i + 1 ? "3px solid #4F46E5" : "2px solid transparent",
                          transform: val === i + 1 ? "scale(1.15)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>밝음</span>
                    <span>어두움</span>
                  </div>
                </div>
              ) : (
                /* 일반 슬라이더 */
                <div>
                  <input
                    type="range"
                    min={feature.min}
                    max={feature.max}
                    value={val}
                    onChange={(e) => onUpdate(feature.id, parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>{isHeight ? `${feature.min}cm` : feature.scale?.split(" - ")[0]}</span>
                    <span>{isHeight ? `${feature.max}cm` : feature.scale?.split(" - ")[1]}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
