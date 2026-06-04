export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateAdminPassword, signAdminToken } from "@/lib/admin";

const LoginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "비밀번호를 입력해주세요." }, { status: 400 });
    }

    if (!validateAdminPassword(parsed.data.password)) {
      return NextResponse.json({ error: "비밀번호가 잘못되었습니다." }, { status: 401 });
    }

    // 어드민 전용 시크릿으로 서명 — 일반 유저 토큰과 교환 불가
    const token = signAdminToken();

    // httpOnly 쿠키 설정 → middleware 서버사이드 페이지 보호용
    const response = NextResponse.json({ token });
    response.cookies.set('kinAdmin', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8, // 8시간
    });
    return response;
  } catch (err) {
    console.error("[admin login]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
