"use client";

import { LifestyleCard } from "@/lib/newSurveyQuestions";

interface LifestyleProps {
  cards: LifestyleCard[];
  onSelect: (value: string) => void;
  selected?: string;
}

export default function SurveyLifestyle({
  cards,
  onSelect,
  selected,
}: LifestyleProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelect(card.value)}
            className={`group relative overflow-hidden rounded-xl border-2 transition ${
              selected === card.value
                ? "border-indigo-600"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* 이미지 영역 */}
            <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {card.value === "home" && "🏠"}
                  {card.value === "nature" && "🏔️"}
                  {card.value === "culture" && "🎬"}
                  {card.value === "social" && "🎉"}
                  {card.value === "hobby" && "🎮"}
                </div>
                <p className="text-white text-sm font-bold drop-shadow">
                  {card.title}
                </p>
              </div>
              {/* 선택 표시 */}
              {selected === card.value && (
                <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                </div>
              )}
            </div>

            {/* 텍스트 영역 */}
            <div className="p-3 bg-white group-hover:bg-slate-50 transition">
              <p className="font-bold text-slate-900 text-sm">{card.title}</p>
              <p className="text-xs text-slate-600 mt-1">{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
