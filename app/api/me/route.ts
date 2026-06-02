import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        age: true,
        region: true,
        status: true,
        survey: { select: { id: true } },
        chatSession: { select: { status: true } },
        persona: { select: { userConfirmed: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    // 온보딩 중이면 정확한 다음 단계 계산
    let nextStep: string | null = null;
    if (user.status === "onboarding") {
      if (!user.survey) {
        nextStep = "/survey";
      } else if (!user.chatSession || user.chatSession.status !== "completed") {
        nextStep = "/chat";
      } else if (!user.persona || !user.persona.userConfirmed) {
        nextStep = "/persona";
      } else {
        nextStep = "/matches"; // 모든 온보딩 완료 → matches로
      }
    }

    // survey/chat/persona 제외한 필드만 반환
    const { survey: _s, chatSession: _c, persona: _p, ...userFields } = user;
    return NextResponse.json({ ...userFields, nextStep });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[GET /api/me]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
