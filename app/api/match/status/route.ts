import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const REGION_TARGET = 50;

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    const me = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!me) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    // 같은 지역에서 매칭 풀에 들어온(=페르소나 확정한 active) 인원
    const regionActiveCount = await prisma.user.count({
      where: { region: me.region, status: "active" },
    });

    // 같은 지역의 이성 후보 수 (실제 매칭 가능 풀)
    const oppositePoolCount = await prisma.user.count({
      where: {
        region: me.region,
        status: "active",
        gender: me.gender === "male" ? "female" : "male",
      },
    });

    return NextResponse.json({
      region: me.region,
      regionActiveCount,
      oppositePoolCount,
      target: REGION_TARGET,
      open: regionActiveCount >= REGION_TARGET,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[match/status GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
