import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./css/MeditationPage.module.css";

const TOTAL_SECONDS = 15 * 60;

export default function MeditationSession() {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(4 * 60 + 28); // 04:28 초기값
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => Math.min(prev + 1, TOTAL_SECONDS));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = (elapsed / TOTAL_SECONDS) * 100;

  const skip = (delta: number) => {
    setElapsed((prev) => Math.min(Math.max(prev + delta, 0), TOTAL_SECONDS));
  };

  return (
    <main className={styles.root}>
      {/* Ambient glow */}
      <div className={styles.ambientGlow} />

      {/* Back button */}
      <button className={styles.backBtn} aria-label="Go back" onClick={() => navigate('/meditationsetup')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* Editorial quote */}
      <div className={styles.quote}>
        "Silence is not the absence of sound,<br />but the presence of focus."
      </div>

      {/* Central Card */}
      <div className={styles.card}>
        {/* Header */}
        <header className={styles.cardHeader}>
          <h1 className={styles.title}>Meditation</h1>
          <div className={styles.listeningBadge}>
            <span className={styles.pulseDot}>
              <span className={styles.pingRing} />
              <span className={styles.dotCore} />
            </span>
            <span className={styles.listeningLabel}>AI Assistant Listening</span>
          </div>
        </header>

        {/* Orb */}
        <div className={styles.orbWrap}>
          <div className={styles.ringOuter} />
          <div className={styles.ringInner} />
          <div className={styles.orb}>
            <div className={styles.orbGlow} />
          </div>
        </div>

        {/* Subtitle */}
        <p className={styles.subtitle}>Take a deep breath</p>

        {/* Timer & Controls */}
        <div className={styles.timerSection}>
          <div className={styles.timerDisplay}>
            <span className={styles.timerElapsed}>{formatTime(elapsed)}</span>
            <span className={styles.timerDivider}>/</span>
            <span className={styles.timerTotal}>{formatTime(TOTAL_SECONDS)}</span>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>

          <div className={styles.controls}>
            <button
              className={styles.controlBtn}
              aria-label="Rewind 10 seconds"
              onClick={() => skip(-10)}
            >
              {/* Replay 10 */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                <text x="8.5" y="15.5" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">10</text>
              </svg>
            </button>

            <button
              className={styles.playPauseBtn}
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={() => setIsPlaying((p) => !p)}
            >
              {isPlaying ? (
                /* Pause icon */
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                /* Play icon */
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              className={styles.controlBtn}
              aria-label="Forward 10 seconds"
              onClick={() => skip(10)}
            >
              {/* Forward 10 */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z" />
                <text x="8.5" y="15.5" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">10</text>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}