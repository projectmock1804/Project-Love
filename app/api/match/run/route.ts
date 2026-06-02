import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ageAcceptable, computeCompatibility, runSimulation } from "@/lib/matching";

const MAX_NEW_MATCHES = 5;

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    const me = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { persona: true, survey: true },
    });

    if (!me || !me.persona || !me.persona.userConfirmed) {
      return NextResponse.json(
        { error: "페르소나를 먼저 확정해주세요" },
        { status: 400 }
      );
    }
    if (!me.survey) {
      return NextResponse.json({ error: "설문을 먼저 완료해주세요" }, { status: 400 });
    }

    // 이미 매칭된 상대 ID 수집 (조기 반환 없이 항상 실행)
    const existingMatches = await prisma.match.findMany({
      where: { OR: [{ user1Id: me.id }, { user2Id: me.id }] },
      select: { user1Id: true, user2Id: true },
    });

    // 기존 매칭 상대를 제외 목록에 추가 (dead code 버그 수정)
    const matchedIds = new Set<string>();
    matchedIds.add(me.id);
    for (const m of existingMatches) {
      matchedIds.add(m.user1Id);
      matchedIds.add(m.user2Id);
    }

    // 현재 매칭 수가 MAX 이상이면 중단
    if (existingMatches.length >= MAX_NEW_MATCHES) {
      return NextResponse.json({ created: 0, message: "이미 매칭이 존재합니다." });
    }

    const remaining = MAX_NEW_MATCHES - existingMatches.length;

    // 설문 응답에서 나이 선호도 추출
    const surveyResponses = me.survey.responses as Record<string, unknown>;
    const myAgeRange = (surveyResponses?.age_range as string) || "±5세";

    // 1차 필터: 이성, active, 페르소나 확정, 미매칭
    const candidates = await prisma.user.findMany({
      where: {
        gender: me.gender === "male" ? "female" : "male",
        status: "active",
        id: { notIn: Array.from(matchedIds) },
        persona: { userConfirmed: true },
        survey: { isNot: null },
      },
      include: { persona: true, survey: true },
      take: 50,
    });

    // 2차 필터: 나이 선호도 (ageAcceptable 적용, 양방향)
    const eligible = candidates.filter((c) => {
      if (!c.survey || !c.persona) return false;
      const theirResponses = c.survey.responses as Record<string, unknown>;
      const theirAgeRange = (theirResponses?.age_range as string) || "±5세";
      // 양방향 모두 만족해야 매칭
      return (
        ageAcceptable(me.age, myAgeRange, c.age) &&
        ageAcceptable(c.age, theirAgeRange, me.age)
      );
    });

    // 같은 지역 우선 정렬 후 남은 슬롯만큼만
    eligible.sort((a, b) => {
      const aSame = a.region === me.region ? 0 : 1;
      const bSame = b.region === me.region ? 0 : 1;
      return aSame - bSame;
    });
    const targets = eligible.slice(0, remaining);

    if (targets.length === 0) {
      return NextResponse.json({
        created: 0,
        message: "현재 당신과 맞는 상대를 모집 중입니다. 곧 알려드릴게요.",
      });
    }

    // LLM 병렬 호출 — 직렬 대비 최대 5× 빠름, Vercel 타임아웃 회피
    const results = await Promise.allSettled(
      targets.map(async (c) => {
        const { compatibilityScore, breakdown, degraded } = await computeCompatibility(
          me.persona!.summaryJson,
          c.persona!.summaryJson
        );
        if (degraded) {
          console.warn("[match/run] degraded compatibility, skipping", c.id);
          return null;
        }
        const simulation = await runSimulation(
          me.persona!.summaryJson,
          c.persona!.summaryJson
        );

        // 시뮬레이션이 빈 배열이면 핵심 기능이 없는 매칭 — 저장하지 않음
        if (simulation.length === 0) {
          console.warn("[match/run] empty simulation, skipping", c.id);
          return null;
        }

        const [u1Id, u2Id] = me.id < c.id ? [me.id, c.id] : [c.id, me.id];
        const [p1Id, p2Id] =
          me.id < c.id
            ? [me.persona!.id, c.persona!.id]
            : [c.persona!.id, me.persona!.id];

        return prisma.match.create({
          data: {
            user1Id: u1Id,
            user2Id: u2Id,
            persona1Id: p1Id,
            persona2Id: p2Id,
            compatibilityScore,
            scoreBreakdownJson: breakdown as object,
            simulationChatJson: simulation as object,
          },
        });
      })
    );

    let created = 0;
    for (const r of results) {
      if (r.status === "fulfilled" && r.value !== null) {
        created++;
      } else if (r.status === "rejected") {
        const err = r.reason;
        // P2002: 이미 같은 (user1Id, user2Id) 매칭 존재 → 정상, skip
        if (
          !(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")
        ) {
          console.error("[match/run] candidate failed", err);
        }
      }
    }

    return NextResponse.json({ created });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[match/run POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
