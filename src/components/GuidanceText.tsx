import { useState, useEffect, type FC } from "react";
import styles from "../pages/css/MeditationPage.module.css";
import { STABILITY_GUIDANCES } from "../hooks/useMeditationLLM";

interface GuidanceTextProps {
  isFinished: boolean;
  isLoading: boolean;
  isUnstable: boolean;
  brainwaveState: "focused" | "stable" | "unstable";
  guidances: string[];
  guidanceIndex: number;
}

export const GuidanceText: FC<GuidanceTextProps> = ({
  isFinished,
  isLoading,
  isUnstable,
  brainwaveState,
  guidances,
  guidanceIndex,
}) => {
  // Determine target text
  let targetText = "Take a deep breath";

  // 불안정 상황의 문장도 한 문장씩 쪼갭니다.
  const unstableGuidances = STABILITY_GUIDANCES.unstable.flatMap((phrase) =>
    phrase.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean),
  );

  if (isFinished) {
    targetText = "Session complete 🎉";
  } else if (isLoading) {
    targetText = "loading...";
  } else if (isUnstable || brainwaveState === "unstable") {
    targetText =
      unstableGuidances[guidanceIndex % unstableGuidances.length] ||
      "Return to your breath";
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
      className={`${styles.subtitle} ${
        isUnstable || brainwaveState === "unstable"
          ? styles.subtitleUnstable
          : ""
      } ${isFading ? styles.subtitleFaded : ""}`}
    >
      {displayText}
    </p>
  );
};
