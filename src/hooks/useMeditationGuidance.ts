import { useState, useEffect, useRef } from "react";
import { generateMeditationGuidances } from "./useMeditationLLM";

interface UseGuidanceReturn {
  guidances: string[];
  guidanceIndex: number;
  guidanceLoading: boolean;
}

export function useMeditationGuidance(theme: string): UseGuidanceReturn {
  const [guidances, setGuidances] = useState<string[]>([]);
  const [guidanceIndex, setGuidanceIndex] = useState(0);
  const [guidanceLoading, setGuidanceLoading] = useState(true);
  const guidanceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // 명상 멘트 로드
  useEffect(() => {
    let isMounted = true;

    const loadGuidances = async () => {
      setGuidanceLoading(true);
      try {
        const loadedGuidances = await generateMeditationGuidances(theme);
        if (isMounted) {
          setGuidances(loadedGuidances);
          setGuidanceIndex(0);
          setGuidanceLoading(false);
        }
      } catch (err) {
        console.error("멘트 로드 실패:", err);
        if (isMounted) {
          setGuidances([]);
          setGuidanceLoading(false);
        }
      }
    };

    loadGuidances();

    return () => {
      isMounted = false;
    };
  }, [theme]);

  // 멘트 회전 타이머 (3초마다)
  useEffect(() => {
    if (guidances.length === 0 || guidanceLoading) return;

    if (guidanceIntervalRef.current) clearInterval(guidanceIntervalRef.current);

    guidanceIntervalRef.current = setInterval(() => {
      setGuidanceIndex((prev) => (prev + 1) % guidances.length);
    }, 3000);

    return () => {
      if (guidanceIntervalRef.current)
        clearInterval(guidanceIntervalRef.current);
    };
  }, [guidances, guidanceLoading]);

  return {
    guidances,
    guidanceIndex,
    guidanceLoading,
  };
}
