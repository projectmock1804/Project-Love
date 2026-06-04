"use client";

import { LifestyleCard } from "@/lib/newSurveyQuestions";

interface LifestyleProps {
  cards: LifestyleCard[];
  onSelect: (value: string) => void;
  selected?: string;
}

// 라이프스타일별 Unsplash 이미지 (무료, 저작권 없음)
const LIFESTYLE_IMAGES: Record<string, string> = {
  home:    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80", // 아늑한 집
  nature:  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", // 등산/자연
  culture: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80", // 영화관
  social:  "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&q=80", // 파티/사람들
  hobby:   "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80", // 게임/취미
};

export default function SurveyLifestyle({ cards, onSelect, selected }: LifestyleProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => {
          const imgSrc = LIFESTYLE_IMAGES[card.value];
          const isSelected = selected === card.value;

          return (
            <button
              key={card.id}
              onClick={() => onSelect(card.value)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-indigo-600 shadow-lg shadow-indigo-100"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* 사진 영역 */}
              <div className="aspect-square relative overflow-hidden bg-slate-200">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // 이미지 로드 실패 시 이모지 대체
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-200 to-slate-300">
                    {card.value === "home" && "🏠"}
                    {card.value === "nature" && "🏔️"}
                    {card.value === "culture" && "🎬"}
                    {card.value === "social" && "🎉"}
                    {card.value === "hobby" && "🎮"}
                  </div>
                )}

                {/* 어두운 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* 선택 체크 */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 텍스트 영역 */}
              <div className={`p-3 transition-colors ${isSelected ? "bg-indigo-50" : "bg-white group-hover:bg-slate-50"}`}>
                <p className="font-bold text-slate-900 text-sm">{card.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{card.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
