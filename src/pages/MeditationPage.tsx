import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from "./css/MeditationPage.module.css";

const TOTAL_ROUNDS = 4;

export default function MeditationSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // setup에서 선택한 분 (3 / 5 / 10) — 라운드 1개의 길이
  const durationMin = parseInt(searchParams.get('duration') || '3');
  const ROUND_SECONDS = durationMin * 60;

  const [currentRound, setCurrentRound] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isFinished) return;

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= ROUND_SECONDS) {
            clearInterval(intervalRef.current!);
            if (currentRound < TOTAL_ROUNDS) {
              setTimeout(() => {
                setCurrentRound((r) => r + 1);
                setElapsed(0);
              }, 800);
            } else {
              setIsFinished(true);
            }
            return ROUND_SECONDS;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentRound, ROUND_SECONDS, isFinished]);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const remaining = ROUND_SECONDS - elapsed;
  const progress = (elapsed / ROUND_SECONDS) * 100;

  const skip = (delta: number) =>
    setElapsed((prev) => Math.min(Math.max(prev + delta, 0), ROUND_SECONDS));

  // 라운드 이동 (dot 클릭 or 좌우 버튼)
  const goToRound = (round: number) => {
    if (round < 1 || round > TOTAL_ROUNDS) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentRound(round);
    setElapsed(0);
    setIsFinished(false);
    setIsPlaying(true);
  };

  const canPrev = currentRound > 1;
  const canNext = currentRound < TOTAL_ROUNDS;

  return (
    <main className={styles.root}>
      <div className={styles.ambientGlow} />

      {/* Back button */}
      <button
        className={styles.backBtn}
        aria-label="Go back"
        onClick={() => navigate('/meditationsetup')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* Editorial quote */}
      <div className={styles.quote}>
        "Silence is not the absence of sound,<br />but the presence of focus."
      </div>

      {/* ── 좌우 세션 버튼 + 카드 ── */}
      <div className={styles.sessionLayout}>

        {/* 이전 라운드 버튼 */}
        <button
          className={`${styles.sideBtn} ${!canPrev ? styles.sideBtnHidden : ""}`}
          aria-label="Previous round"
          onClick={() => goToRound(currentRound - 1)}
          disabled={!canPrev}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className={styles.sideBtnLabel}>Round {currentRound - 1}</span>
        </button>

        {/* ── Central Card ── */}
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

          {/* Round dots */}
          <div className={styles.roundIndicator}>
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <button
                key={i}
                className={`${styles.roundDot} ${
                  i + 1 < currentRound
                    ? styles.roundDotDone
                    : i + 1 === currentRound
                    ? styles.roundDotActive
                    : styles.roundDotPending
                }`}
                onClick={() => goToRound(i + 1)}
                aria-label={`Go to round ${i + 1}`}
              />
            ))}
            <span className={styles.roundLabel}>
              Round {currentRound} / {TOTAL_ROUNDS}
            </span>
          </div>

          {/* Orb */}
          <div className={styles.orbWrap}>
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
            <div className={`${styles.orb} ${isFinished ? styles.orbFinished : ""}`}>
              <div className={styles.orbGlow} />
            </div>
          </div>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            {isFinished ? "Session complete 🎉" : "Take a deep breath"}
          </p>

          {/* Timer & Controls */}
          <div className={styles.timerSection}>
            <div className={styles.timerDisplay}>
              {/* 남은 시간 / setup에서 선택한 분 */}
              <span className={styles.timerElapsed}>{formatTime(remaining)}</span>
              <span className={styles.timerDivider}>/</span>
              <span className={styles.timerTotal}>{formatTime(ROUND_SECONDS)}</span>
            </div>

            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            {!isFinished ? (
              <div className={styles.controls}>
                <button className={styles.controlBtn} aria-label="Rewind 10 seconds" onClick={() => skip(-10)}>
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
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <button className={styles.controlBtn} aria-label="Forward 10 seconds" onClick={() => skip(10)}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z" />
                    <text x="8.5" y="15.5" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">10</text>
                  </svg>
                </button>
              </div>
            ) : (
              <button className={styles.finishBtn} onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* 다음 라운드 버튼 */}
        <button
          className={`${styles.sideBtn} ${!canNext ? styles.sideBtnHidden : ""}`}
          aria-label="Next round"
          onClick={() => goToRound(currentRound + 1)}
          disabled={!canNext}
        >
          <span className={styles.sideBtnLabel}>Round {currentRound + 1}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

      </div>
    </main>
  );
}