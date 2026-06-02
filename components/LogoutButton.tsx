"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = () => {
    // token + user 데이터 모두 제거 (공용 기기 보안)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };
  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-gray-700 underline"
    >
      로그아웃
    </button>
  );
}
