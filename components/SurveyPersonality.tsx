"use client";

import { PersonalityScenario } from "@/lib/newSurveyQuestions";

interface PersonalityProps {
  scenario: PersonalityScenario;
  onSelect: (value: string) => void;
  selected?: string;
}

export default function SurveyPersonality({
  scenario,
  onSelect,
  selected,
}: PersonalityProps) {
  return (
    <div className="w-full">
      {/* 상황 배경 */}
      <div className="mb-4 px-3 py-2 bg-slate-100 rounded-lg">
        <p className="text-xs text-slate-500 font-medium">{scenario.context}</p>
      </div>

      {/* 시나리오 질문 */}
      <div className="mb-6 p-4 bg-white border-2 border-slate-200 rounded-2xl">
        <p className="text-slate-900 font-bold text-base leading-relaxed">
          💭 {scenario.scenario}
        </p>
      </div>

      {/* 선택지 — 채팅 말풍선 스타일 */}
      <div className="space-y-3">
        {scenario.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              selected === option.value
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {/* 말풍선 스타일 메시지 */}
                <div
                  className={`inline-block px-3 py-2 rounded-2xl rounded-tl-sm text-sm mb-2 ${
                    selected === option.value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {option.message}
                </div>
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1 ${
                  selected === option.value
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-slate-300"
                }`}
              >
                {selected === option.value && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
