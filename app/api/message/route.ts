import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const SendSchema = z.object({
  matchId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const parsed = SendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "메시지를 입력해주세요" }, { status: 400 });
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

    if (!match.unlocked) {
      return NextResponse.json(
        { error: "결제 후 메시지를 보낼 수 있습니다" },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: { matchId: match.id, senderId: myId, content: parsed.data.content },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[message POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const matchId = req.nextUrl.searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json({ error: "matchId가 필요합니다" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: { select: { id: true, name: true, email: true } },
        user2: { select: { id: true, name: true, email: true } },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "매칭을 찾을 수 없습니다" }, { status: 404 });
    }

    const myId = authUser.userId;
    if (match.user1Id !== myId && match.user2Id !== myId) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
    }

    if (!match.unlocked) {
      return NextResponse.json(
        { error: "결제 후 대화를 볼 수 있습니다", unlocked: false },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { matchId },
      orderBy: { createdAt: "asc" },
    });

    const iAmUser1 = match.user1Id === myId;
    const other = iAmUser1 ? match.user2 : match.user1;

    // 잠금 해제 후 연락처(이메일) 교환
    return NextResponse.json({
      unlocked: true,
      myId,
      messages,
      contact: { name: other.name, email: other.email },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[message GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
