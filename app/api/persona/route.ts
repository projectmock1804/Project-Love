import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const PersonaPutSchema = z.object({
  confirmed: z.boolean().optional(),
  summaryJson: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    const persona = await prisma.persona.findUnique({
      where: { userId: authUser.userId },
    });

    if (!persona) {
      return NextResponse.json({ error: "페르소나가 아직 생성되지 않았습니다" }, { status: 404 });
    }

    return NextResponse.json({ persona });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[persona GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const parsed = PersonaPutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
    }

    // _failed 페르소나는 확정 불가 — 쓰레기 데이터로 매칭 진입 차단
    const currentPersona = await prisma.persona.findUnique({
      where: { userId: authUser.userId },
    });
    if (!currentPersona) {
      return NextResponse.json({ error: "페르소나가 없습니다. AI 채팅을 먼저 완료해주세요." }, { status: 404 });
    }
    const existingJson = currentPersona.summaryJson as Record<string, unknown>;
    if (existingJson?._failed === true && !parsed.data.summaryJson) {
      // 사용자가 직접 수정 내용 없이 실패 페르소나를 확정하려는 경우 차단
      return NextResponse.json(
        { error: "페르소나 생성에 실패했습니다. AI와 다시 대화해주세요.", failed: true },
        { status: 400 }
      );
    }

    const updateData: Parameters<typeof prisma.persona.update>[0]["data"] = {
      userConfirmed: true,
    };
    if (parsed.data.summaryJson) {
      // 수정된 summaryJson이 오면 _failed 플래그 제거 후 저장
      const cleaned = { ...parsed.data.summaryJson };
      delete cleaned._failed;
      updateData.summaryJson = cleaned as object;
    }

    const persona = await prisma.persona.update({
      where: { userId: authUser.userId },
      data: updateData,
    });

    await prisma.user.update({
      where: { id: authUser.userId },
      data: { status: "active" },
    });

    return NextResponse.json({ persona });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[persona PUT]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
