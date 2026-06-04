const CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

function getTossSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) {
    throw new Error("TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.");
  }
  return key;
}
const TIMEOUT_MS = 10_000; // Toss API 타임아웃 10초

export interface TossConfirmResult {
  ok: boolean;
  status?: string;
  totalAmount?: number;
  orderId?: string;
  error?: string;
}

/**
 * Toss Payments 결제 승인.
 * 금액 위변조 방지를 위해 amount는 서버가 저장한 값과 반드시 일치해야 한다.
 * 타임아웃(10초) + JSON 파싱 에러 처리 포함.
 */
export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<TossConfirmResult> {
  const basicToken = Buffer.from(`${getTossSecretKey()}:`).toString("base64");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
      signal: controller.signal,
    });

    let data: Record<string, unknown>;
    try {
      data = await res.json();
    } catch {
      return { ok: false, error: "Toss 응답 파싱 실패" };
    }

    if (!res.ok) {
      return { ok: false, error: (data.message as string) || "결제 승인 실패" };
    }

    return {
      ok: true,
      status: data.status as string,
      totalAmount: data.totalAmount as number,
      orderId: data.orderId as string,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Toss API 타임아웃 (10초 초과)" };
    }
    return { ok: false, error: err instanceof Error ? err.message : "네트워크 오류" };
  } finally {
    clearTimeout(timer);
  }
}
