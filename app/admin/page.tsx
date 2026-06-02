"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardData {
  summary: {
    totalUsers: number;
    activeUsers: number;
    waitlistUsers: number;
    onboardingUsers: number;
    totalMatches: number;
    totalMessages: number;
    totalPayments: number;
    totalRevenue: number;
  };
  usersByRegion: Array<{ region: string; count: number }>;
  recentUsers: Array<{ id: string; email: string; name: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          router.push("/admin/login");
          return null; // 명시적 null 반환 → 다음 .then에서 data=null로 처리
        }
        if (!res.ok) {
          throw new Error(`서버 오류: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => { if (data) setData(data); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    localStorage.removeItem("adminToken");
    // 서버사이드 쿠키도 삭제
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">데이터 없음</div>;

  const { summary, usersByRegion, recentUsers } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Kin 어드민</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="총 사용자" value={summary.totalUsers} color="blue" />
          <StatCard label="활성 사용자" value={summary.activeUsers} color="green" />
          <StatCard label="웨이트리스트" value={summary.waitlistUsers} color="yellow" />
          <StatCard label="온보딩 중" value={summary.onboardingUsers} color="purple" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="총 매칭" value={summary.totalMatches} color="indigo" />
          <StatCard label="총 메시지" value={summary.totalMessages} color="pink" />
          <StatCard label="총 결제" value={summary.totalPayments} color="cyan" />
          <StatCard label="수익 (원)" value={`${(summary.totalRevenue / 10000).toLocaleString()}만`} color="green" />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/users" className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition">
            <h3 className="font-bold text-slate-900 mb-2">👥 사용자 관리</h3>
            <p className="text-sm text-slate-600">사용자 검색 및 관리</p>
          </Link>
          <Link href="/admin/matches" className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition">
            <h3 className="font-bold text-slate-900 mb-2">💘 매칭 관리</h3>
            <p className="text-sm text-slate-600">매칭 현황 확인</p>
          </Link>
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">📊 분석 (준비중)</h3>
            <p className="text-sm text-slate-600">상세 통계</p>
          </div>
        </div>

        {/* Regions & Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Regions */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">지역별 사용자</h2>
            <div className="space-y-2">
              {usersByRegion.map((r) => (
                <div key={r.region} className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-700">{r.region}</span>
                  <span className="font-bold text-slate-900">{r.count}명</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">최근 가입자</h2>
            <div className="space-y-2">
              {recentUsers.map((u) => (
                <div key={u.id} className="py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-900 border-blue-200",
    green: "bg-green-50 text-green-900 border-green-200",
    yellow: "bg-yellow-50 text-yellow-900 border-yellow-200",
    purple: "bg-purple-50 text-purple-900 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-900 border-indigo-200",
    pink: "bg-pink-50 text-pink-900 border-pink-200",
    cyan: "bg-cyan-50 text-cyan-900 border-cyan-200",
  };

  return (
    <div className={`${colorMap[color as keyof typeof colorMap]} rounded-lg border p-6`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
