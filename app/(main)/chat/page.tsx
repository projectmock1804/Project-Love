"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LogoutButton from "@/components/LogoutButton";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const FIRST_MESSAGE =
  "안녕하세요! 저는 Kin의 AI예요. 당신을 조금 더 알아가고 싶어서요. 편하게 이야기해주세요 😊\n\n요즘 어떻게 지내고 계세요? 연애나 만남에 대해 생각하게 된 계기가 있나요?";

const MAX_USER_TURNS = 20;

export default function ChatPage() {
  const router = useRouter();
  useRequireAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatStatus, setChatStatus] = useState<"new" | "active" | "completed">("new");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadChat() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // 빈 세션이면 첫 AI 메시지를 클라이언트에서 표시
        const msgs: ChatMessage[] = Array.isArray(data.messages) && data.messages.length > 0
          ? data.messages
          : [{ role: "assistant", content: FIRST_MESSAGE }];
        setMessages(msgs);
        setChatStatus(data.status);
        if (data.status === "completed") {
          router.push("/persona");
        }
      } else {
        setError("채팅을 불러올 수 없습니다.");
      }
    } catch {
      setError("채팅을 불러오는 중 오류가 발생했습니다.");
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages(m => [...m, { role: "assistant", content: data.reply }]);
        if (data.completed) {
          setChatStatus("completed");
          setTimeout(() => router.push("/persona"), 2000);
        }
      } else {
        // 실패 시 낙관적으로 추가했던 사용자 메시지 롤백
        setMessages(m => m.slice(0, -1));
        setError(data.error || "메시지 전송에 실패했습니다.");
      }
    } catch {
      setMessages(m => m.slice(0, -1));
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  // 한글 IME 조합 중 Enter 오발송 방지
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      sendMessage();
    }
  }

  const userTurnCount = messages.filter(m => m.role === "user").length;
  // 8번 이상 답했을 때 "거의 완료" 힌트
  const showProgressHint = userTurnCount >= 6 && chatStatus !== "completed";
  const remainingHint = Math.max(0, 8 - userTurnCount);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-stone-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-stone-900">Kin AI</h1>
            <p className="text-xs text-stone-400">
              {chatStatus === "completed"
                ? "대화 완료 — 페르소나 생성 중..."
                : userTurnCount === 0
                ? "편하게 이야기해주세요"
                : `${userTurnCount}번 답변됨`}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* 진행 힌트 바 */}
      {showProgressHint && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2">
          <p className="max-w-lg mx-auto text-xs text-indigo-600 text-center">
            {remainingHint > 0
              ? `조금만 더요! ${remainingHint}개 정도 더 나누면 페르소나가 완성돼요 ✨`
              : "충분히 대화했어요! AI가 곧 페르소나를 완성합니다 🎉"}
          </p>
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-stone-900 text-white rounded-br-md"
                    : "bg-white border border-stone-200 text-stone-800 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {chatStatus === "completed" && (
            <div className="text-center py-4">
              <p className="text-sm text-stone-500">페르소나 생성 중... 잠시만 기다려주세요 🎉</p>
            </div>
          )}

          {error && (
            <div className="text-center py-2">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 입력창 */}
      {chatStatus !== "completed" && (
        <div className="bg-white border-t border-stone-200 px-4 py-4">
          <div className="max-w-lg mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="편하게 이야기해주세요..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-5 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition disabled:opacity-40"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
