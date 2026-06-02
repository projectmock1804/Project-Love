"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  compatibilityScore: number;
  user1: { email: string; name: string };
  user2: { email: string; name: string };
  user1Interested: boolean;
  user2Interested: boolean;
  unlocked: boolean;
  createdAt: string;
}

export default function AdminMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch("/api/admin/matches", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => data && setMatches(data.matches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">
              ← 대시보드
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">매칭 관리</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">사용자 1</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">사용자 2</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">호환도</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">관심 표시</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">메시지 잠금 해제</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">생성일</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <p className="font-medium">{match.user1.name}</p>
                      <p className="text-sm text-slate-600">{match.user1.email}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-medium">{match.user2.name}</p>
                      <p className="text-sm text-slate-600">{match.user2.email}</p>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${match.compatibilityScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{match.compatibilityScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        match.user1Interested && match.user2Interested
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}>
                        {match.user1Interested ? "✓" : "✗"} / {match.user2Interested ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        match.unlocked
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-800"
                      }`}>
                        {match.unlocked ? "잠금 해제됨" : "잠금됨"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {new Date(match.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
