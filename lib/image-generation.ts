/**
 * OpenRouter를 사용해 당신의 이상형 이미지를 생성합니다.
 * Flux Pro 또는 DALL-E-3 사용
 */

interface SurveyData {
  appearance_winner?: {
    name: string;
    faceShape?: string;
  };
  body_features?: Record<string, number>;
}

function buildImagePrompt(survey: SurveyData): string {
  const parts: string[] = [];

  // 1. 기본 설정
  parts.push("Create a realistic, professional portrait photo of a beautiful person");

  // 2. 얼굴형 (있으면)
  if (survey.appearance_winner?.faceShape) {
    const faceShapeMap: Record<string, string> = {
      oval: "with an oval face shape",
      round: "with a round face shape",
      square: "with a square face shape",
      heart: "with a heart-shaped face",
      long: "with a long rectangular face shape",
    };
    const faceDesc = faceShapeMap[survey.appearance_winner.faceShape];
    if (faceDesc) parts.push(faceDesc);
  }

  // 3. 체형/신체 조건 (있으면)
  if (survey.body_features) {
    const weight = survey.body_features["weight"];
    if (weight) {
      if (weight <= 3) parts.push("very slim physique");
      else if (weight <= 5) parts.push("slim and toned physique");
      else if (weight <= 7) parts.push("average, healthy physique");
      else parts.push("curvy, fuller physique");
    }

    const height = survey.body_features["height"];
    if (height) {
      if (height <= 160) parts.push("petite");
      else if (height <= 170) parts.push("average height");
      else parts.push("tall");
    }

    const skinTone = survey.body_features["skin_tone"];
    if (skinTone) {
      if (skinTone <= 3) parts.push("fair skin tone");
      else if (skinTone <= 5) parts.push("medium skin tone");
      else if (skinTone <= 7) parts.push("olive skin tone");
      else parts.push("deep skin tone");
    }
  }

  // 4. 헤어 (다양성)
  parts.push("with stylish hair, professional makeup, natural lighting");

  // 5. 마무리
  parts.push(
    "professional studio photography, high quality, hd resolution, portrait orientation"
  );

  return parts.join(", ") + ". The person looks friendly, confident, and approachable.";
}

async function generateAppearanceImage(
  survey: SurveyData
): Promise<string | null> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn(
        "[image-generation] OPENROUTER_API_KEY not set, skipping image generation"
      );
      return null;
    }

    const prompt = buildImagePrompt(survey);

    console.log("[image-generation] Calling OpenRouter with prompt:", prompt.substring(0, 100));

    const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://project-love-di4s.onrender.com",
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux-pro",
        prompt,
        width: 1024,
        height: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[image-generation] OpenRouter error: ${response.status} ${error}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      console.warn("[image-generation] No image URL in response");
      return null;
    }

    console.log("[image-generation] Image generated successfully");
    return imageUrl;
  } catch (err) {
    console.error(
      "[image-generation] Error:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export { generateAppearanceImage, buildImagePrompt };
