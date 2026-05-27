/**
 * 명상 세션을 위한 Gemini API 통합
 * 프롬프트를 통해 친절하고 따뜻한 명상 지도를 제공합니다.
 */

export interface MeditationTheme {
  type: string;
  label: string;
  koreanName: string;
  description: string;
  guidances: string[];
}

// 생성된 멘트 캐시
const guidanceCache = new Map<string, string[]>();
const CACHE_KEY_PREFIX = "meditation_guidance_";

/**
 * LocalStorage에서 캐시된 멘트 읽기
 */
function getCachedGuidance(themeType: string): string[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + themeType);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("❌ LocalStorage 읽기 실패:", e);
  }
  return null;
}

/**
 * LocalStorage에 캐시된 멘트 저장
 */
function setCachedGuidance(themeType: string, guidances: string[]): void {
  try {
    localStorage.setItem(
      CACHE_KEY_PREFIX + themeType,
      JSON.stringify(guidances),
    );
  } catch (e) {
    console.warn("❌ LocalStorage 저장 실패:", e);
  }
}

const THEMES: Record<string, MeditationTheme> = {
  "self-esteem": {
    type: "self-esteem",
    label: "Self-esteem",
    koreanName: "자존감",
    description: "Cultivate inner worth and discover your true strength",
    guidances: [
      "You are already worthy and valuable.",
      "Take a deep breath and love yourself.",
      "Feel the light within you.",
      "Every moment helps me grow.",
      "I accept myself as I am.",
      "Your existence itself has meaning.",
    ],
  },
  relationships: {
    type: "relationships",
    label: "Relationships",
    koreanName: "인간관계",
    description: "Connect with others through compassion and understanding",
    guidances: [
      "Open your heart to understand others.",
      "Breathe with compassion and empathy.",
      "We are all connected.",
      "A kind word can heal someone.",
      "I grow through relationships.",
      "Accept others as they are.",
    ],
  },
  rest: {
    type: "rest",
    label: "Rest",
    koreanName: "휴식",
    description: "Deep relaxation and restoration for body and mind",
    guidances: [
      "Gently let your body rest.",
      "All tension is dissolving.",
      "You are safe now.",
      "Relax deeply like peaceful sleep.",
      "Your body and mind are healing.",
      "Find new strength in complete rest.",
    ],
  },
  focus: {
    type: "focus",
    label: "Focus",
    koreanName: "집중",
    description: "Sharpen your mind and improve concentration",
    guidances: [
      "Bring your mind to single focus.",
      "Focus on your breath and clear your mind.",
      "Stay only in this present moment.",
      "Focus with a clear and open mind.",
      "Let go of all distractions.",
      "Move forward with clarity and purpose.",
    ],
  },
  calm: {
    type: "calm",
    label: "Calm",
    koreanName: "평온함",
    description: "Find peace and tranquility within",
    guidances: [
      "Everything flows naturally.",
      "Rest here, in this present moment.",
      "Let your mind settle into peace.",
      "Serenity arrives with each breath.",
      "Release worry and embrace peace.",
      "This moment is enough.",
    ],
  },
  free: {
    type: "free",
    label: "Free",
    koreanName: "자유",
    description: "Unguided meditation with ambient sound",
    guidances: [
      "Begin your meditation with ease.",
      "Let yourself flow with natural breath.",
      "Follow the flow of free thoughts.",
      "Move with the music and follow your heart.",
      "Fully experience this moment.",
      "Surrender to deep meditation.",
    ],
  },
};

// 테마별 멘트 배열 (회전용)
export const THEME_GUIDANCES: Record<string, string[]> = {
  "self-esteem": THEMES["self-esteem"].guidances,
  relationships: THEMES.relationships.guidances,
  rest: THEMES.rest.guidances,
  focus: THEMES.focus.guidances,
  calm: THEMES.calm.guidances,
  free: THEMES.free.guidances,
};

/**
 * Gemini API를 통해 동적으로 명상 멘트 생성
 * 명상 세션 시작 시 테마별로 8개의 AI 생성 멘트를 받아옵니다.
 * 캐싱 및 재시도 로직 포함
 */
export async function generateMeditationGuidances(
  themeType: string,
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  // ✅ 1단계: 메모리 캐시에서 먼저 확인
  if (guidanceCache.has(themeType)) {
    console.log(`✅ 메모리 캐시에서 멘트 로드: ${themeType}`);
    return guidanceCache.get(themeType)!;
  }

  // ✅ 2단계: LocalStorage 캐시에서 확인
  const storageCached = getCachedGuidance(themeType);
  if (storageCached) {
    console.log(`✅ 저장된 캐시에서 멘트 로드: ${themeType}`);
    guidanceCache.set(themeType, storageCached); // 메모리 캐시에도 저장
    return storageCached;
  }

  if (!apiKey) {
    console.warn("❌ API 키 없음. 기본 멘트 사용");
    return THEME_GUIDANCES[themeType] || THEME_GUIDANCES.calm;
  }

  const theme = THEMES[themeType] || THEMES["calm"];
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `You are an experienced meditation guide.
Write calm, gentle, and supportive meditation phrases in English.
Each phrase should be 1-2 sentences, concise yet profound.
All phrases should be in present tense or imperative form, conveying comfort and hope.`;

  const userPrompt = `Generate 8 unique meditation guidance phrases for "${theme.label}" meditation.

Meditation goal: ${theme.description}

Each phrase should:
- Be in English, 1-2 sentences
- Have a soft and supportive tone
- Include themes of breath, mind, body, or present moment
- Help users focus on their meditation
- Convey different messages

Respond ONLY with this JSON format:
{
  "guidances": [
    "phrase 1",
    "phrase 2",
    "phrase 3",
    "phrase 4",
    "phrase 5",
    "phrase 6",
    "phrase 7",
    "phrase 8"
  ]
}

Return ONLY the JSON, no other text.`;

  // 재시도 로직 (최대 3회)
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(
        `🔄 Generating AI guidance... (${theme.label}) [Attempt ${attempt + 1}/${MAX_RETRIES}]`,
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4000,
            responseMimeType: "application/json",
          },
        }),
      });

      // 429 (Rate Limit) 에러 처리
      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000; // 1초, 2초, 4초
        console.warn(`⏳ Rate Limit (429) - ${waitTime}ms 대기 후 재시도...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue; // 다음 시도로
      }

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // JSON 추출 시도
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (
            Array.isArray(parsed.guidances) &&
            parsed.guidances.length > 0 &&
            parsed.guidances.every((g: unknown) => typeof g === "string")
          ) {
            console.log(`✅ AI 멘트 생성 완료: ${parsed.guidances.length}개`);
            // ✅ 메모리 캐시에 저장
            guidanceCache.set(themeType, parsed.guidances);
            // ✅ LocalStorage에도 저장 (페이지 새로고침 후에도 유지)
            setCachedGuidance(themeType, parsed.guidances);
            return parsed.guidances;
          }
        } catch (parseError) {
          console.error("❌ JSON 파싱 실패:", parseError);
        }
      }

      console.warn("⚠️ 응답 형식 검증 실패. 받은 텍스트:", responseText);
      throw new Error("응답 형식 오류");
    } catch (error) {
      // 마지막 시도에서도 실패하면 기본 멘트 사용
      if (attempt === MAX_RETRIES - 1) {
        console.warn("⚠️ AI 생성 실패, 기본 멘트 사용:", error);
        const fallback = THEME_GUIDANCES[themeType] || THEME_GUIDANCES.calm;
        guidanceCache.set(themeType, fallback);
        setCachedGuidance(themeType, fallback);
        return fallback;
      }
    }
  }

  // 안전장치: 모든 경로에서 반드시 값을 반환
  console.error("❌ 예상치 못한 오류: 모든 재시도가 실패했습니다.", themeType);
  const finalFallback = THEME_GUIDANCES[themeType] || THEME_GUIDANCES.calm;
  setCachedGuidance(themeType, finalFallback);
  return finalFallback;
}

// 집중/안정 상태에 따른 특별 가이드 멘트
export const STABILITY_GUIDANCES = {
  // 불안정/움직임이 많을 때
  unstable: [
    "Find your stability. Return to your breath.",
    "Gently settle your body and mind.",
    "Let your restlessness dissolve.",
    "Ground yourself in this moment.",
    "Your breath will guide you home.",
    "Come back to center.",
  ],
  // 완벽한 집중 상태
  focused: [
    "You are exactly where you need to be.",
    "Deep in your meditation now.",
    "Let this peace fill your being.",
    "You are perfectly still.",
    "In this silence, find yourself.",
    "Stay with this sacred calm.",
  ],
};

// 뇌파 지표 타입
export interface BrainwaveMetrics {
  attention: number; // 0-100 (집중도)
  meditation: number; // 0-100 (명상도)
  signal: number; // 신호 품질 (0-200, 0이 최고)
}

// 뇌파 상태 판단
export function assessBrainwaveState(
  metrics: BrainwaveMetrics,
): "focused" | "stable" | "unstable" {
  // 신호 품질이 좋지 않으면 불안정
  if (metrics.signal > 150) return "unstable";

  // 명상도가 높으면 안정적
  if (metrics.meditation > 60) return "stable";

  // 집중도가 높으면 집중 상태
  if (metrics.attention > 60) return "focused";

  // 둘 다 낮으면 불안정
  if (metrics.attention < 30 && metrics.meditation < 30)
    return "unstable";

  return "stable";
}

export function useMeditationLLM() {
  return {
    themes: THEMES,
    guidances: THEME_GUIDANCES,
    generateMeditationGuidances,
    stabilityGuidances: STABILITY_GUIDANCES,
    assessBrainwaveState,
  };
}
