import type { FC } from "react";
import type { BrainwaveMetrics } from "../hooks/useMeditationLLM";
import styles from "../pages/css/MeditationPage.module.css";

interface BrainwaveStatusProps {
  connected: boolean;
  metrics: BrainwaveMetrics;
}

export const BrainwaveStatus: FC<BrainwaveStatusProps> = ({
  connected,
  metrics,
}) => {
  return (
    <div className={styles.brainwaveStatus}>
      <span
        className={`${styles.brainwaveDot} ${
          connected
            ? styles.brainwaveDotConnected
            : styles.brainwaveDotDisconnected
        }`}
      />
      <span className={styles.brainwaveLabel}>
        {connected
          ? `🧠 Att: ${metrics.attention} Med: ${metrics.meditation}`
          : "🧠 Offline"}
      </span>
    </div>
  );
};
