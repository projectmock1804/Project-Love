import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const InterestSchema = z.object({
  matchId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const parsed = InterestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: parsed.data.matchId },
    });

    if (!match) {
      return NextResponse.json({ error: "매칭을 찾을 수 없습니다" }, { status: 404 });
    }

    const myId = authUser.userId;
    if (match.user1Id !== myId && match.user2Id !== myId) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
    }

    const iAmUser1 = match.user1Id === myId;
    const updated = await prisma.match.update({
      where: { id: match.id },
      data: iAmUser1 ? { user1Interested: true } : { user2Interested: true },
    });

    const mutual = updated.user1Interested && updated.user2Interested;

    return NextResponse.json({
      myInterest: true,
      theirInterest: iAmUser1 ? updated.user2Interested : updated.user1Interested,
      mutual,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[match/interest POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
