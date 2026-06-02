import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const MESSAGE_PRICE = 10000;

const CreateSchema = z.object({
  matchId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);

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

    // 양방향 관심이 성립해야만 결제 가능
    if (!(match.user1Interested && match.user2Interested)) {
      return NextResponse.json(
        { error: "양측이 서로 관심을 표현해야 메시지를 보낼 수 있습니다" },
        { status: 400 }
      );
    }

    if (match.unlocked) {
      return NextResponse.json({ error: "이미 잠금 해제된 매칭입니다" }, { status: 400 });
    }

    // 같은 (userId, matchId) pending/processing 결제가 이미 있으면 재사용
    // processing도 포함 — 동시 confirm 중에 중복 결제창 생성 방지
    const existingPending = await prisma.payment.findFirst({
      where: { userId: myId, matchId: match.id, status: { in: ["pending", "processing"] } },
    });

    if (existingPending && existingPending.tossKey) {
      return NextResponse.json({
        orderId: existingPending.tossKey,
        amount: MESSAGE_PRICE,
        orderName: "Kin 메시지 잠금 해제",
      });
    }

    const orderId = `kin_${match.id}_${crypto.randomUUID()}`;

    await prisma.payment.create({
      data: {
        userId: myId,
        matchId: match.id,
        amount: MESSAGE_PRICE,
        tossKey: orderId, // 임시로 orderId 저장, confirm 시 paymentKey로 갱신
        status: "pending",
      },
    });

    return NextResponse.json({
      orderId,
      amount: MESSAGE_PRICE,
      orderName: "Kin 메시지 잠금 해제",
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[payment/create POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
