import type { FC } from "react";
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
  let text = "Take a deep breath";

  if (isFinished) {
    text = "Session complete 🎉";
  } else if (isLoading) {
    text = "loading...";
  } else if (isUnstable || brainwaveState === "unstable") {
    text =
      STABILITY_GUIDANCES.unstable[
        guidanceIndex % STABILITY_GUIDANCES.unstable.length
      ];
  } else if (guidances.length > 0) {
    text = guidances[guidanceIndex] || "Take a deep breath";
  }

  return (
    <p
      className={`${styles.subtitle} ${
        isUnstable || brainwaveState === "unstable"
          ? styles.subtitleUnstable
          : ""
      }`}
    >
      {text}
    </p>
  );
};
