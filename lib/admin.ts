import crypto from "crypto";
import jwt from "jsonwebtoken";

// 어드민 JWT 전용 시크릿 (일반 유저 JWT_SECRET 과 분리)
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!ADMIN_JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET 환경변수가 설정되지 않았습니다.");
}

/** 어드민 비밀번호 동적 생성 (패턴 + MMDD) */
function getAdminPassword(): string {
  const pattern = process.env.ADMIN_PASSWORD_PATTERN;
  if (!pattern) {
    throw new Error("ADMIN_PASSWORD_PATTERN 환경변수가 설정되지 않았습니다.");
  }

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const mmdd = month + date;

  return pattern + mmdd;
}

/** 어드민 비밀번호 검증 — constant-time 비교로 타이밍 공격 방지 */
export function validateAdminPassword(input: string): boolean {
  try {
    const expectedPassword = getAdminPassword();
    const inputBuf = Buffer.from(input);
    const storedBuf = Buffer.from(expectedPassword);
    if (inputBuf.length !== storedBuf.length) {
      // 길이 다를 때도 동일 시간을 소비하도록 dummy 비교
      crypto.timingSafeEqual(Buffer.alloc(storedBuf.length), storedBuf);
      return false;
    }
    return crypto.timingSafeEqual(inputBuf, storedBuf);
  } catch {
    return false;
  }
}

/** 어드민 JWT 발급 */
export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, ADMIN_JWT_SECRET as string, { expiresIn: "8h" });
}

/** 어드민 JWT 검증 — role 확인 포함. 실패 시 예외 throw */
export function verifyAdminToken(token?: string): void {
  if (!token) throw new Error("No token");
  let decoded: unknown;
  try {
    decoded = jwt.verify(token, ADMIN_JWT_SECRET as string);
  } catch {
    throw new Error("Invalid token");
  }
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    (decoded as Record<string, unknown>).role !== "admin"
  ) {
    throw new Error("Invalid token");
  }
}
