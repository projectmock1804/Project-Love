import crypto from "crypto";
import jwt from "jsonwebtoken";

function getAdminJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET 환경변수가 설정되지 않았습니다.");
  return secret;
}

/** 어드민 비밀번호 동적 생성 (패턴 + MMDD, KST 기준) */
function getAdminPassword(): string {
  const pattern = process.env.ADMIN_PASSWORD_PATTERN;
  if (!pattern) throw new Error("ADMIN_PASSWORD_PATTERN 환경변수가 설정되지 않았습니다.");

  // KST(UTC+9) 기준으로 날짜 계산
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const date = String(now.getUTCDate()).padStart(2, "0");

  return pattern + month + date;
}

/** 어드민 비밀번호 검증 — constant-time 비교로 타이밍 공격 방지 */
export function validateAdminPassword(input: string): boolean {
  try {
    const expectedPassword = getAdminPassword();
    const inputBuf = Buffer.from(input);
    const storedBuf = Buffer.from(expectedPassword);
    if (inputBuf.length !== storedBuf.length) {
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
  return jwt.sign({ role: "admin" }, getAdminJwtSecret(), { expiresIn: "8h" });
}

/** 어드민 JWT 검증 — role 확인 포함. 실패 시 예외 throw */
export function verifyAdminToken(token?: string): void {
  if (!token) throw new Error("No token");
  let decoded: unknown;
  try {
    decoded = jwt.verify(token, getAdminJwtSecret());
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
