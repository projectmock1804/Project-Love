"use client";

import { useEffect } from "react";
import { BodyFeatureQuestion } from "@/lib/newSurveyQuestions";

interface BodyFeaturesProps {
  features: BodyFeatureQuestion[];
  onUpdate: (feature: string, value: number) => void;
  responses: Record<string, number>;
}

export default function SurveyBodyFeatures({
  features,
  onUpdate,
  responses,
}: BodyFeaturesProps) {
  // 마운트 시 응답에 없는 슬라이더를 기본값(중간값)으로 초기화
  // → 사용자가 드래그 안 해도 완료 조건 충족
  useEffect(() => {
    for (const f of features) {
      if (responses[f.id] === undefined) {
        onUpdate(f.id, Math.floor((f.min + f.max) / 2));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div className="space-y-8">
        {features.map((feature) => (
          <div key={feature.id} className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">{feature.feature}</h3>
              <span className="text-2xl font-bold text-indigo-600">
                {responses[feature.id] ?? Math.floor((feature.min + feature.max) / 2)}
              </span>
            </div>

            <input
              type="range"
              min={feature.min}
              max={feature.max}
              value={responses[feature.id] ?? Math.floor((feature.min + feature.max) / 2)}
              onChange={(e) => onUpdate(feature.id, parseInt(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div className="flex justify-between text-sm text-slate-500 mt-3">
              <span>{feature.min}</span>
              <span className="text-center text-xs">{feature.scale}</span>
              <span>{feature.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
