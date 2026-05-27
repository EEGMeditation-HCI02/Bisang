import { useState, useEffect, type FC } from "react";
import styles from "../pages/css/MeditationPage.module.css";

interface GuidanceTextProps {
  isFinished: boolean;
  isLoading: boolean;
  guidances: string[];
  guidanceIndex: number;
}

export const GuidanceText: FC<GuidanceTextProps> = ({
  isFinished,
  isLoading,
  guidances,
  guidanceIndex,
}) => {
  // Determine target text
  let targetText = "Take a deep breath";

  if (isFinished) {
    targetText = "Session complete 🎉";
  } else if (isLoading) {
    targetText = "loading...";
  } else if (guidances.length > 0) {
    targetText = guidances[guidanceIndex] || "Take a deep breath";
  }

  const [displayText, setDisplayText] = useState(targetText);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (displayText === targetText) return;

    // 1단계: Fade out 시작
    setIsFading(true);

    // 2단계: 800ms 후 텍스트를 교체하고 Fade in
    const timer = setTimeout(() => {
      setDisplayText(targetText);
      setIsFading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [targetText, displayText]);

  return (
    <p
      className={`${styles.subtitle} ${isFading ? styles.subtitleFaded : ""}`}
    >
      {displayText}
    </p>
  );
};
