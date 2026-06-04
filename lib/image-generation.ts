/**
 * OpenRouter Gemini Flash Image를 사용해 이상형 이미지를 생성합니다.
 * 모델: google/gemini-2.5-flash-image (무료, chat completions 방식)
 * 응답: base64 PNG → data URI 반환
 */

interface SurveyData {
  appearance_winner?: { name?: string; faceShape?: string };
  body_features?: Record<string, number>;
}

function buildImagePrompt(survey: SurveyData): string {
  const parts: string[] = [
    "Generate a realistic portrait photo of an attractive East Asian person.",
  ];

  // 얼굴형
  const faceShapeMap: Record<string, string> = {
    oval:   "oval-shaped face",
    round:  "round face",
    square: "strong square jaw",
    heart:  "heart-shaped face with defined cheekbones",
    long:   "long oval face",
  };
  const faceShape = survey.appearance_winner?.faceShape;
  if (faceShape && faceShapeMap[faceShape]) {
    parts.push(faceShapeMap[faceShape]);
  }

  // 체형/키/피부
  const bf = survey.body_features ?? {};
  const weight = bf["weight"];
  if (weight) {
    if      (weight <= 3) parts.push("very slim figure");
    else if (weight <= 6) parts.push("slim toned figure");
    else                  parts.push("curvy full figure");
  }
  const skin = bf["skin_tone"];
  if (skin) {
    if      (skin <= 3) parts.push("fair porcelain skin");
    else if (skin <= 6) parts.push("warm medium skin tone");
    else                parts.push("rich deep skin tone");
  }

  parts.push("stylish modern outfit, soft natural studio lighting, photorealistic, 4K portrait");
  return parts.join(", ") + ". Friendly confident expression, looking at camera.";
}

async function generateAppearanceImage(survey: SurveyData): Promise<string | null> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn("[image-gen] OPENROUTER_API_KEY not set");
      return null;
    }

    const prompt = buildImagePrompt(survey);
    console.log("[image-gen] Calling Gemini Flash Image:", prompt.substring(0, 80));

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://project-love-di4s.onrender.com",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[image-gen] OpenRouter error ${res.status}:`, err.substring(0, 200));
      return null;
    }

    const data = await res.json();

    // 응답 구조: choices[0].message.images[0].image_url.url (base64 data URI)
    const images = data.choices?.[0]?.message?.images;
    if (images && images.length > 0) {
      const url = images[0]?.image_url?.url;
      if (url) {
        console.log("[image-gen] ✅ Image generated (base64), length:", url.length);
        return url; // "data:image/png;base64,..."
      }
    }

    console.warn("[image-gen] No image in response:", JSON.stringify(data).substring(0, 200));
    return null;
  } catch (err) {
    console.error("[image-gen] Error:", err instanceof Error ? err.message : err);
    return null;
  }
}

export { generateAppearanceImage, buildImagePrompt };
