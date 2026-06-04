import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { chat } from "@/lib/openrouter";
import { extractJson } from "@/lib/json";

const SYSTEM_CHAT = `You are a warm conversation partner for Kin, a Korean dating app. ALWAYS respond in Korean (한국어로만 대답하세요). Never use Chinese, English, or any other language.

파악할 주제 (5가지):
1. 갈등/관계 (갈등 처리 방식, 전 연애에서 배운 것)
2. 가치관 (돈, 일, 가족에 대한 생각)
3. 연애 스타일 (연락 빈도, 데이트 스타일, 감정 표현)
4. 미래 비전 (5년 뒤 모습, 결혼에 대한 생각)
5. 성격 디테일 (유머 스타일, 스트레스 해소법)

규칙:
- 반드시 한국어로만 답변합니다 (중국어, 영어 절대 금지)
- 한 번에 하나씩만 물어봅니다
- 친한 친구와 대화하는 자연스럽고 따뜻한 톤으로
- 정확히 5번의 사용자 답변 후 "이야기 잘 들었어요! 이제 당신의 페르소나를 만들어볼게요." 라고 마무리하고, 그 응답 맨 끝에 정확히 [[PERSONA_READY]] 토큰을 출력합니다
- 개인정보(연락처, SNS 등)는 절대 묻지 않습니다`;

const SYSTEM_EXTRACT = `Analyze the conversation below and create a persona JSON. All text values MUST be written in Korean (한국어). Never use Chinese or English in the values.
대화에서 명확히 드러난 것만 넣고, 모르는 항목은 null로 표기하세요. 추측하지 마세요.
각 필드는 구체적이고 디테일하게 작성하세요. 한두 단어가 아니라 문장/문단으로 설명해주세요.

JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요:
{
  "summary": "이 사람을 전체적으로 설명하는 문단. 성격, 가치관, 삶의 방식 포함. 200-300자",
  "personality_keywords": ["성격을 나타내는 키워드 3-5개"],
  "communication_tone": "대화 톤과 표현 방식 (직설적인지, 배려형인지, 유머러스한지 등). 50-100자",
  "conflict_style": "갈등을 어떻게 처리하는지 구체적으로. 어떤 상황에서 어떻게 반응하는지",
  "emotion_expression": "감정을 어떻게 표현하는지. 솔직한지, 신중한지, 과장적인지 등",
  "five_year_vision": "5년 뒤 자신의 모습을 어떻게 그리고 있는가",
  "marriage_view": "결혼/장기 관계에 대한 생각. 구체적인 기대와 우려",
  "date_style": "이상적인 데이트의 구체적인 모습. 어떤 활동, 어떤 분위기를 선호",
  "contact_frequency": "연락 빈도에 대한 생각. 왜 그렇게 생각하는가",
  "life_priority": ["인생에서 중요하게 생각하는 것들을 순서대로"],
  "humor_style": "유머 감각. 어떤 종류의 농담을 좋아하고 싫어하는가",
  "stress_relief": "스트레스를 어떻게 풀고, 힘들 때 어떻게 회복하는가",
  "daily_routine": "일상적인 습관과 루틴. 아침을 어떻게 시작하고 저녁을 어떻게 보내는가",
  "financial_style": "돈에 대한 생각. 절약/소비 성향, 경제적 목표",
  "work_life_balance": "일과 삶의 균형을 어떻게 맞추고 싶은가",
  "likes": ["구체적으로 좋아하는 것들. 이유도 함께"],
  "dislikes": ["싫어하거나 불편한 것들. 왜 싫어하는가"],
  "past_relationship_lesson": "이전 연애나 관계에서 배운 것들"
}`;

const MessageSchema = z.object({
  message: z.string().min(1).max(1000),
});

// 사용자당 최대 메시지 수 (5번 왕복 후 페르소나 생성)
const MAX_USER_MESSAGES = 5;

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const parsed = MessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "메시지를 입력해주세요" }, { status: 400 });
    }

    let session = await prisma.chatSession.findUnique({
      where: { userId: authUser.userId },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: authUser.userId,
          messagesJson: [{ role: "assistant", content: "안녕하세요! 저는 Kin의 AI예요. 당신을 조금 더 알아가고 싶어서요. 편하게 이야기해주세요 😊\n\n요즘 어떻게 지내고 계세요? 연애나 만남에 대해 생각하게 된 계기가 있나요?" }],
        },
      });
    }

    if (session.status === "completed") {
      return NextResponse.json({ error: "채팅이 이미 완료되었습니다" }, { status: 400 });
    }

    // Array.isArray 체크 — DB 손상 시 크래시 방지
    if (!Array.isArray(session.messagesJson)) {
      console.error("[chat POST] messagesJson is not an array", session.id);
      return NextResponse.json({ error: "채팅 데이터가 손상되었습니다. 관리자에게 문의해주세요." }, { status: 500 });
    }
    const messages = session.messagesJson as Array<{ role: string; content: string }>;

    // 사용자 메시지 상한 체크 (비용 제어)
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (userMessageCount >= MAX_USER_MESSAGES) {
      return NextResponse.json(
        { error: "최대 대화 횟수에 도달했습니다. 페르소나 생성을 진행해주세요." },
        { status: 400 }
      );
    }

    messages.push({ role: "user", content: parsed.data.message });

    console.log("[chat POST] Calling OpenRouter... messages count:", messages.length);
    let aiReply: string;
    try {
      aiReply = await chat(
        [{ role: "system", content: SYSTEM_CHAT }, ...messages as Array<{ role: "system" | "user" | "assistant"; content: string }>],
        { maxTokens: 300, temperature: 0.8 }
      );
      console.log("[chat POST] OpenRouter success, reply length:", aiReply.length);
    } catch (chatError) {
      console.error("[chat POST] OpenRouter call failed:", chatError instanceof Error ? chatError.message : chatError);
      throw chatError;
    }

    const currentUserCount = messages.filter((m: { role: string }) => m.role === "user").length;
    const isComplete =
      (currentUserCount >= 8 && aiReply.includes("[[PERSONA_READY]]")) ||
      currentUserCount >= MAX_USER_MESSAGES;
    // 사용자/저장에는 완료 토큰 노출 안 함
    const cleanReply = aiReply.replace(/\[\[PERSONA_READY\]\]/g, "").trim();

    messages.push({ role: "assistant", content: cleanReply });

    await prisma.chatSession.update({
      where: { userId: authUser.userId },
      data: {
        messagesJson: messages,
        status: isComplete ? "completed" : "active",
      },
    });

    if (isComplete) {
      const conversationText = messages
        .filter((m) => m.role !== "system")
        .map((m) => `${m.role === "user" ? "사용자" : "AI"}: ${m.content}`)
        .join("\n");

      // 설문 데이터를 페르소나 추출에 포함 (이상형 선호, 성격 시나리오, 라이프스타일 반영)
      const userSurvey = await prisma.survey.findUnique({
        where: { userId: authUser.userId },
      });
      const surveyContext = userSurvey
        ? `\n\n[설문 응답 데이터]\n${JSON.stringify(userSurvey.responses, null, 2)}`
        : "";

      const personaJson = await chat(
        [
          { role: "system", content: SYSTEM_EXTRACT },
          { role: "user", content: conversationText + surveyContext },
        ],
        { maxTokens: 800, temperature: 0.3 }
      );

      let persona = extractJson<Record<string, unknown>>(personaJson);

      if (!persona) {
        // 1회 재시도: JSON만 출력하도록 더 강하게 지시
        const retry = await chat(
          [
            { role: "system", content: SYSTEM_EXTRACT + "\n\n반드시 유효한 JSON 객체만 출력하세요. 설명, 마크다운, 코드펜스 금지." },
            { role: "user", content: conversationText },
          ],
          { maxTokens: 800, temperature: 0.1 }
        );
        persona = extractJson<Record<string, unknown>>(retry);
      }

      if (!persona) {
        persona = { summary: "대화 분석은 완료되었으나 페르소나 정제에 실패했습니다. AI와 다시 대화해주세요.", _failed: true };
      }

      await prisma.persona.upsert({
        where: { userId: authUser.userId },
        update: { summaryJson: persona as object, userConfirmed: false },
        create: { userId: authUser.userId, summaryJson: persona as object, userConfirmed: false },
      });

      return NextResponse.json({
        reply: cleanReply,
        completed: true,
        message: "페르소나 생성이 완료되었습니다",
      });
    }

    return NextResponse.json({ reply: cleanReply, completed: false });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[chat POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const session = await prisma.chatSession.findUnique({
      where: { userId: authUser.userId },
    });

    if (!session) {
      return NextResponse.json({
        messages: [{ role: "assistant", content: "안녕하세요! 저는 Kin의 AI예요. 당신을 조금 더 알아가고 싶어서요. 편하게 이야기해주세요 😊\n\n요즘 어떻게 지내고 계세요? 연애나 만남에 대해 생각하게 된 계기가 있나요?" }],
        status: "new",
      });
    }

    return NextResponse.json({
      messages: session.messagesJson,
      status: session.status,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    console.error("[chat GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
