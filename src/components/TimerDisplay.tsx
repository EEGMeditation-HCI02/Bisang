import type { FC } from "react";
import styles from "../pages/css/MeditationPage.module.css";
import { formatTime } from "../utils/timeUtils";

interface TimerDisplayProps {
  remaining: number;
  total: number;
  progress: number;
}

export const TimerDisplay: FC<TimerDisplayProps> = ({
  remaining,
  total,
  progress,
}) => {
  return (
    <div className={styles.timerSection}>
      <div className={styles.timerDisplay}>
        <span className={styles.timerElapsed}>{formatTime(remaining)}</span>
        <span className={styles.timerDivider}>/</span>
        <span className={styles.timerTotal}>{formatTime(total)}</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
