import { useState, useEffect, useRef } from "react";

interface UseMotionStabilityReturn {
  isUnstable: boolean;
}

export function useMotionStability(): UseMotionStabilityReturn {
  const [isUnstable, setIsUnstable] = useState(false);
  const motionResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionCountRef = useRef(0);

  useEffect(() => {
    const handleMotion = () => {
      motionCountRef.current += 1;

      // 움직임이 많으면 불안정 상태 활성화
      if (motionCountRef.current > 3) {
        setIsUnstable(true);
      }

      // 기존 타이머 초기화
      if (motionResetRef.current) clearTimeout(motionResetRef.current);

      // 5초 동안 움직임이 없으면 리셋
      motionResetRef.current = setTimeout(() => {
        motionCountRef.current = 0;
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

  return { isUnstable };
}
