"use client";

import { useState } from "react";
import { OPEN_ENDED_QUESTIONS } from "@/lib/newSurveyQuestions";

interface SurveyOpenEndedProps {
  responses: Record<string, string>;
  onComplete: (responses: Record<string, string>) => void;
}

export default function SurveyOpenEnded({ responses, onComplete }: SurveyOpenEndedProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(responses);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentQuestion = OPEN_ENDED_QUESTIONS[currentIdx];
  const allAnswersValid = OPEN_ENDED_QUESTIONS.every(
    (q) => answers[q.id]?.trim().length > 0
  );

  const handleNext = () => {
    const answer = answers[currentQuestion.id] || "";

    // 검증
    if (!answer.trim()) {
      setErrors({ [currentQuestion.id]: "답변을 입력해주세요" });
      return;
    }
    if (answer.length > currentQuestion.maxLength) {
      setErrors({
        [currentQuestion.id]: `최대 ${currentQuestion.maxLength}자까지 입력 가능합니다`,
      });
      return;
    }

    setErrors({});

    if (currentIdx < OPEN_ENDED_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleComplete = () => {
    // 마지막 질문 검증
    const answer = answers[currentQuestion.id] || "";
    if (!answer.trim()) {
      setErrors({ [currentQuestion.id]: "답변을 입력해주세요" });
      return;
    }
    if (answer.length > currentQuestion.maxLength) {
      setErrors({
        [currentQuestion.id]: `최대 ${currentQuestion.maxLength}자까지 입력 가능합니다`,
      });
      return;
    }

    onComplete(answers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            당신을 더 알아볼게요
          </h2>
          <p className="text-gray-600">
            자신의 이야기를 자유롭게 나눠주세요
          </p>

          {/* 진행도 */}
          <div className="mt-4 flex gap-1">
            {OPEN_ENDED_QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full ${
                  idx <= currentIdx ? "bg-pink-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {currentIdx + 1} / {OPEN_ENDED_QUESTIONS.length}
          </p>
        </div>

        {/* 질문 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

          <textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= currentQuestion.maxLength) {
                setAnswers({
                  ...answers,
                  [currentQuestion.id]: value,
                });
                setErrors({});
              }
            }}
            placeholder={currentQuestion.placeholder}
            className={`w-full p-4 border-2 rounded-lg font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none ${
              errors[currentQuestion.id] ? "border-red-500" : "border-gray-300"
            }`}
            rows={5}
          />

          {/* 글자 수 표시 */}
          <div className="flex justify-between items-center mt-2">
            <div>
              {errors[currentQuestion.id] && (
                <p className="text-red-500 text-sm font-medium">
                  ⚠️ {errors[currentQuestion.id]}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {answers[currentQuestion.id]?.length || 0} / {currentQuestion.maxLength}
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              currentIdx === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            이전
          </button>

          {currentIdx < OPEN_ENDED_QUESTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]?.trim()}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                answers[currentQuestion.id]?.trim()
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!allAnswersValid}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                allAnswersValid
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
