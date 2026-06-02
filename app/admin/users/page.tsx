"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string;
  gender: string;
  age: number;
  region: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchUsers = useCallback((q: string, st: string) => {
    const token = localStorage.getItem("adminToken");
    if (!token) { router.push("/admin/login"); return; }

    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (st) params.append("status", st);

    fetch(`/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          router.push("/admin/login");
          return null;
        }
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
        return res.json();
      })
      .then((data) => data && setUsers(data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  // 디바운스: 검색어 입력 300ms 후 API 호출
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search, status), 300);
    return () => clearTimeout(timer);
  }, [search, status, fetchUsers]);

  async function handleDelete(userId: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const token = localStorage.getItem("adminToken");
    if (!token) { router.push("/admin/login"); return; }

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류로 삭제에 실패했습니다.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">
              ← 대시보드
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">사용자 관리</h1>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="이메일 또는 이름으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="waitlist">웨이트리스트</option>
            <option value="onboarding">온보딩</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">이름</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">이메일</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">성별/나이</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">지역</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">상태</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">가입일</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">삭제</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-3">{user.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-3 text-sm">{user.gender === "male" ? "남" : "여"} / {user.age}</td>
                    <td className="px-6 py-3 text-sm">{user.region}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        user.status === "active" ? "bg-green-100 text-green-800" :
                        user.status === "waitlist" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {user.status === "active" ? "활성" : user.status === "waitlist" ? "웨이트리스트" : "온보딩"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        삭제
                      </button>
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
