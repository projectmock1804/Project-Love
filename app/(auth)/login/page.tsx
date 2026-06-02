"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // /api/me 로 정확한 다음 단계 조회
      try {
        const meRes = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          router.push(me.nextStep || "/matches");
          return;
        }
      } catch { /* fallback */ }

      // 폴백: status 기반
      router.push(data.user.status === "onboarding" ? "/survey" : "/matches");
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Kin</h1>
          <p className="text-stone-500 mt-2">AI가 검증하는 진지한 만남</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 space-y-4">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">로그인</h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">이메일</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900"
              placeholder="비밀번호 입력"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition disabled:opacity-50"
          >
            {loading ? "처리 중..." : "로그인"}
          </button>

          <p className="text-center text-sm text-stone-500">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="text-stone-900 font-medium underline">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
