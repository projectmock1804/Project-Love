import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { confirmTossPayment } from "@/lib/toss";

const ConfirmSchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const parsed = ConfirmSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
    }

    const { paymentKey, orderId, amount } = parsed.data;
    const userId = authUser.userId;

    // 동시 요청 방지: pending → processing 원자적 클레임
    const claim = await prisma.payment.updateMany({
      where: { tossKey: orderId, status: "pending" },
      data: { status: "processing" },
    });
    if (claim.count === 0) {
      return NextResponse.json({ error: "이미 처리된 결제입니다." }, { status: 409 });
    }

    const payment = await prisma.payment.findFirst({
      where: { tossKey: orderId, status: "processing" },
    });
    if (!payment) {
      return NextResponse.json({ error: "결제 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    if (payment.userId !== userId) {
      // 권한 없음 → processing 유지하지 말고 pending 복원 (본인 아닌 요청)
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "pending" } });
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 금액 위변조 방지
    if (payment.amount !== amount) {
      // 금액 불일치 = 악의적 변조 가능성 → failed 처리 (pending 복원 금지)
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
      return NextResponse.json({ error: "결제 금액이 일치하지 않습니다" }, { status: 400 });
    }

    // Toss 결제 승인 (타임아웃 10초 포함)
    const result = await confirmTossPayment(paymentKey, orderId, amount);

    if (!result.ok) {
      // Toss 승인 실패 → failed 처리. pending 복원하지 않아야 고착 방지
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
      return NextResponse.json({ error: result.error || "결제 승인 실패" }, { status: 400 });
    }

    // Toss 응답 재검증 (위변조·미완료 방지)
    if (
      result.status !== "DONE" ||
      result.totalAmount !== payment.amount ||
      result.orderId !== orderId
    ) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
      return NextResponse.json({ error: "결제 검증에 실패했습니다" }, { status: 400 });
    }

    // 성공: 트랜잭션으로 결제 success + match unlock 원자 처리
    await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.updateMany({
        where: { id: payment.id, status: "processing" },
        data: { status: "success", tossKey: paymentKey },
      });
      if (updated.count === 0) {
        throw new Error("ALREADY_PROCESSED");
      }
      await tx.match.update({
        where: { id: payment.matchId },
        data: { unlocked: true },
      });
    });

    return NextResponse.json({ success: true, matchId: payment.matchId });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "ALREADY_PROCESSED") {
      return NextResponse.json({ error: "이미 처리된 결제입니다" }, { status: 409 });
    }
    console.error("[payment/confirm POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
