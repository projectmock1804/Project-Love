import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const SurveySchema = z.object({
  responses: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const parsed = SurveySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
    }

    const responsesJson = parsed.data.responses as object;
    const survey = await prisma.survey.upsert({
      where: { userId: authUser.userId },
      update: { responses: responsesJson },
      create: { userId: authUser.userId, responses: responsesJson },
    });

    return NextResponse.json({ survey }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[survey POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    const survey = await prisma.survey.findUnique({
      where: { userId: authUser.userId },
    });

    if (!survey) {
      return NextResponse.json({ error: "설문을 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json({ survey });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[survey GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
