import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    verifyAdminToken(token);

    const { searchParams } = req.nextUrl;
    const query = searchParams.get("q");
    const status = searchParams.get("status");

    const where: Prisma.UserWhereInput = {};
    if (query) {
      where.OR = [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        age: true,
        region: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ users });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("token") ? 401 : 500;
    if (status === 500) console.error("[admin users GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    verifyAdminToken(token);

    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "사용자 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("token") ? 401 : 500;
    if (status === 500) console.error("[admin users DELETE]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status });
  }
}
