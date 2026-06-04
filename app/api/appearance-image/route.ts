import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateAppearanceImage } from "@/lib/image-generation";

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    // 사용자의 설문 데이터 조회
    const survey = await prisma.survey.findUnique({
      where: { userId: authUser.userId },
    });

    if (!survey) {
      return NextResponse.json(
        { error: "설문 데이터를 찾을 수 없습니다" },
        { status: 400 }
      );
    }

    // 설문 응답 파싱
    const responses = survey.responses as Record<string, unknown>;

    // DALL-E로 이미지 생성
    const imageUrl = await generateAppearanceImage(responses as {
      appearance_winner?: { name: string; faceShape?: string };
      body_features?: Record<string, number>;
    });

    if (!imageUrl) {
      return NextResponse.json(
        { error: "이미지 생성에 실패했습니다. 나중에 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[appearance-image POST]", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
