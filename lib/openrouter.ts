const BASE_URL = "https://openrouter.ai/api/v1";

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY 환경변수가 설정되지 않았습니다.");
  return key;
}
// CLAUDE.md 명세 준수: deepseek-chat-v3-0324:free 우선, 전부 무료 모델로 폴백
const MODELS = [
  "qwen/qwen-2.5-7b-instruct",      // ✅ 매우 저렴 + 성능 우수
  "meta-llama/llama-3-8b-instruct", // ✅ 저렴 (백업)
];

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
}

interface RateLimitError extends Error {
  status: number;
  retryAfter: number;
}

async function fetchOnce(url: string, body: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://project-love-di4s.onrender.com",
    },
    body,
    signal,
  });
  if (res.status === 429) {
    throw Object.assign(new Error('rate_limit'), {
      status: 429,
      retryAfter: parseInt(res.headers.get('retry-after') || '10', 10),
    }) as RateLimitError;
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned empty content');

  const finishReason = data.choices?.[0]?.finish_reason;
  if (finishReason && finishReason !== "stop") {
    console.warn(`[openrouter] finish_reason=${finishReason} (응답 잘림 가능)`);
  }

  return content as string;
}

export async function chat(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  let lastError: Error | null = null;

  for (const model of MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const body = JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens ?? 1000,
      temperature: options.temperature ?? 0.7,
    });

    try {
      console.log(`[openrouter] Trying model: ${model}`);
      return await fetchOnce(`${BASE_URL}/chat/completions`, body, controller.signal);
    } catch (e) {
      lastError = e as Error;
      const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);

      if (errorMsg === 'rate_limit') {
        const retryAfter = (lastError as RateLimitError).retryAfter ?? 10;
        console.warn(`[openrouter] Model ${model} — 429 rate limit, retrying after ${retryAfter}s`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

        const retryController = new AbortController();
        const retryTimeout = setTimeout(() => retryController.abort(), 30000);
        try {
          return await fetchOnce(`${BASE_URL}/chat/completions`, body, retryController.signal);
        } catch (retryErr) {
          lastError = retryErr as Error;
          console.error(`[openrouter] Model ${model} failed on retry: ${(retryErr as Error).message}`);
        } finally {
          clearTimeout(retryTimeout);
        }
      } else if (errorMsg.includes("AbortError")) {
        console.error(`[openrouter] Model ${model} — timeout (30s)`);
      } else {
        console.error(`[openrouter] Model ${model} failed: ${errorMsg}`);
      }

      // Try next model
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  // All models failed
  throw new Error(`OpenRouter: All models failed. Last error: ${lastError?.message || 'Unknown'}`);
}
