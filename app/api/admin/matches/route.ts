import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    verifyAdminToken(token);

    const matches = await prisma.match.findMany({
      include: {
        user1: { select: { email: true, name: true } },
        user2: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ matches });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("token") ? 401 : 500;
    if (status === 500) console.error("[admin matches GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status });
  }
}
