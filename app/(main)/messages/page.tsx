"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LogoutButton from "@/components/LogoutButton";

interface Msg {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

function MessagesInner() {
  const params = useSearchParams();
  const router = useRouter();
  useRequireAuth();
  const matchId = params.get("matchId") || "";

  const [state, setState] = useState<"loading" | "locked" | "unlocked" | "error">("loading");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [myId, setMyId] = useState("");
  const [contact, setContact] = useState<{ name: string; email: string } | null>(null);
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [paying, setPaying] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const confirmedRef = useRef(false);

  function authHeaders() {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");
    const payfail = params.get("payfail");

    if (payfail) {
      setErrorMsg("결제가 취소되었습니다.");
      loadConversation();
    } else if (paymentKey && orderId && amount) {
      confirmPayment(paymentKey, orderId, Number(amount));
    } else {
      loadConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    setState("loading");
    const res = await fetch("/api/payment/confirm", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    if (res.ok) {
      router.replace(`/messages?matchId=${matchId}`);
      loadConversation();
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "결제 확인 실패");
      setState("error");
    }
  }

  async function loadConversation() {
    if (!matchId) {
      setState("error");
      setErrorMsg("잘못된 접근입니다");
      return;
    }
    const res = await fetch(`/api/message?matchId=${matchId}`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      setMyId(data.myId);
      setContact(data.contact);
      setState("unlocked");
    } else if (res.status === 403) {
      setState("locked");
    } else {
      setState("error");
      setErrorMsg("대화를 불러올 수 없습니다");
    }
  }

  async function startPayment() {
    setPaying(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ matchId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error);
        setPaying(false);
        return;
      }

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        setErrorMsg("결제 설정 오류");
        setPaying(false);
        return;
      }
      const toss = await loadTossPayments(clientKey);
      const payment = toss.payment({ customerKey: myId || `kin_${matchId}` });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: data.amount },
        orderId: data.orderId,
        orderName: data.orderName,
        successUrl: `${window.location.origin}/messages?matchId=${matchId}`,
        failUrl: `${window.location.origin}/messages?matchId=${matchId}&payfail=1`,
      });
    } catch {
      setErrorMsg("결제 요청 중 오류가 발생했습니다");
      setPaying(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ matchId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((m) => [...m, data.message]);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "메시지 전송에 실패했습니다.");
      }
    } catch {
      setErrorMsg("메시지 전송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">불러오는 중...</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
        <p className="text-stone-600">{errorMsg}</p>
        <button onClick={() => router.push("/matches")} className="mt-4 px-5 py-2 bg-stone-900 text-white rounded-xl text-sm">
          매칭으로 돌아가기
        </button>
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-8 text-center">
          <h1 className="text-xl font-bold text-stone-900">메시지 잠금 해제</h1>
          <p className="text-stone-500 text-sm mt-2 leading-relaxed">
            서로 관심을 표현했어요.
            <br />
            결제하면 메시지를 보내고 연락처를 교환할 수 있습니다.
          </p>
          <div className="my-6">
            <span className="text-3xl font-bold text-stone-900">10,000원</span>
          </div>
          {errorMsg && <p className="text-red-500 text-sm mb-3">{errorMsg}</p>}
          <button
            onClick={startPayment}
            disabled={paying}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition disabled:opacity-40"
          >
            {paying ? "결제창 여는 중..." : "결제하고 메시지 보내기"}
          </button>
          <button onClick={() => router.push("/matches")} className="w-full mt-3 py-3 text-stone-500 text-sm">
            나중에 하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="bg-white border-b border-stone-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-stone-900">{contact?.name}</h1>
            {contact?.email && (
              <p className="text-xs text-green-600">📧 이메일: {contact.email}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/matches")} className="text-sm text-stone-400">
              ← 매칭
            </button>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-stone-400 py-8">
              첫 메시지를 보내보세요. 좋은 인연이 되길 바라요 💛
            </p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === myId ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  msg.senderId === myId
                    ? "bg-stone-900 text-white rounded-br-md"
                    : "bg-white border border-stone-200 text-stone-800 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {errorMsg && (
            <p className="text-center text-sm text-red-500 py-1">{errorMsg}</p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="bg-white border-t border-stone-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && sendMessage()}
            placeholder="메시지를 입력하세요..."
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="px-5 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition disabled:opacity-40"
          >
            {sending ? "..." : "전송"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <MessagesInner />
    </Suspense>
  );
}
