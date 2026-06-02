import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const myId = authUser.userId;

    const matches = await prisma.match.findMany({
      where: { OR: [{ user1Id: myId }, { user2Id: myId }] },
      include: {
        user1: { include: { persona: true } },
        user2: { include: { persona: true } },
      },
      orderBy: { compatibilityScore: "desc" },
    });

    const result = matches.map((m) => {
      const iAmUser1 = m.user1Id === myId;
      const other = iAmUser1 ? m.user2 : m.user1;
      const myInterest = iAmUser1 ? m.user1Interested : m.user2Interested;
      const theirInterest = iAmUser1 ? m.user2Interested : m.user1Interested;
      const mutual = m.user1Interested && m.user2Interested;

      return {
        matchId: m.id,
        compatibilityScore: m.compatibilityScore,
        breakdown: m.scoreBreakdownJson,
        simulation: m.simulationChatJson,
        // 결제 전: 연락처 등 개인정보 미노출. 이름은 첫 글자만.
        other: {
          name: other.name.charAt(0) + "○○",
          age: other.age,
          region: other.region,
          personaSummary:
            (other.persona?.summaryJson as { summary?: string } | null)?.summary ?? null,
        },
        myInterest,
        theirInterest,
        mutual,
        unlocked: m.unlocked,
      };
    });

    return NextResponse.json({ matches: result });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[match GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
