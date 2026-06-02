"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp는 초 단위 Unix timestamp
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true; // 파싱 실패 = 무효 토큰
  }
}

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, []); // deps 비워도 마운트 시 1회 체크면 충분
}
