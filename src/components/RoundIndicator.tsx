import type { FC } from "react";
import styles from "../pages/css/MeditationPage.module.css";

interface RoundIndicatorProps {
  currentRound: number;
  totalRounds: number;
  onGoToRound: (round: number) => void;
}

export const RoundIndicator: FC<RoundIndicatorProps> = ({
  currentRound,
  totalRounds,
  onGoToRound,
}) => {
  return (
    <div className={styles.roundIndicator}>
      {Array.from({ length: totalRounds }).map((_, i) => (
        <button
          key={i}
          className={`${styles.roundDot} ${
            i + 1 < currentRound
              ? styles.roundDotDone
              : i + 1 === currentRound
                ? styles.roundDotActive
                : styles.roundDotPending
          }`}
          onClick={() => onGoToRound(i + 1)}
          aria-label={`Go to round ${i + 1}`}
        />
      ))}
      <span className={styles.roundLabel}>
        Round {currentRound} / {totalRounds}
      </span>
    </div>
  );
};
