import { useState, useEffect, useRef } from "react";

interface UseMotionStabilityReturn {
  isUnstable: boolean;
  unstableCount: number; // 세션 동안 총 불안정 횟수
}

export function useMotionStability(): UseMotionStabilityReturn {
  const [isUnstable, setIsUnstable] = useState(false);
  const [unstableCount, setUnstableCount] = useState(0);
  const motionResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionCountRef = useRef(0);
  const wasUnstableRef = useRef(false); // 중복 카운트 방지

  useEffect(() => {
    const handleMotion = () => {
      motionCountRef.current += 1;

      if (motionCountRef.current > 3) {
        // 새로 불안정 상태가 된 경우에만 카운트 증가
        if (!wasUnstableRef.current) {
          wasUnstableRef.current = true;
          setUnstableCount((prev) => prev + 1);
        }
        setIsUnstable(true);
      }

      if (motionResetRef.current) clearTimeout(motionResetRef.current);

      motionResetRef.current = setTimeout(() => {
        motionCountRef.current = 0;
        wasUnstableRef.current = false;
        setIsUnstable(false);
      }, 5000);
    };

    window.addEventListener("mousemove", handleMotion);
    window.addEventListener("touchmove", handleMotion);

    return () => {
      window.removeEventListener("mousemove", handleMotion);
      window.removeEventListener("touchmove", handleMotion);
      if (motionResetRef.current) clearTimeout(motionResetRef.current);
    };
  }, []);

  return { isUnstable, unstableCount };
}