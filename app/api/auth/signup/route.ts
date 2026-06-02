import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

const SignupSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다").max(128),
  name: z.string().min(1, "이름을 입력해주세요").max(100),
  gender: z.enum(["male", "female"], { message: "성별을 선택해주세요" }),
  age: z.number().int().min(18).max(100),
  region: z.string().min(1, "지역을 입력해주세요").max(200),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, gender, age, region } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, gender, age, region },
    });

    const token = signToken({ userId: user.id });

    return NextResponse.json(
      {
        token,
        user: { id: user.id, email: user.email, name: user.name, gender: user.gender, age: user.age, region: user.region, status: user.status },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
