import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    verifyAdminToken(token); // role:'admin' + ADMIN_JWT_SECRET 검증

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { status: "active" } });
    const waitlistUsers = await prisma.user.count({ where: { status: "waitlist" } });
    const onboardingUsers = await prisma.user.count({ where: { status: "onboarding" } });

    const totalMatches = await prisma.match.count();
    const totalMessages = await prisma.message.count();
    const totalPayments = await prisma.payment.count();
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "success" }, // 수정: 'completed' → 'success' (스키마 일치)
    });

    const usersByRegion = await prisma.user.groupBy({
      by: ["region"],
      _count: true,
    });

    const recentUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      summary: {
        totalUsers,
        activeUsers,
        waitlistUsers,
        onboardingUsers,
        totalMatches,
        totalMessages,
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      usersByRegion: usersByRegion.map((r) => ({ region: r.region, count: r._count })),
      recentUsers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("token") ? 401 : 500;
    if (status === 500) console.error("[admin dashboard]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status });
  }
}
