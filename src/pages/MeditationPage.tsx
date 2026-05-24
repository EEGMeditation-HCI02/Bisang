import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./css/MeditationPage.module.css";
import { useMeditationTimer } from "../hooks/useMeditationTimer";
import { useMeditationMusic } from "../hooks/useMeditationMusic";
import { useBrainwaveConnection } from "../hooks/useBrainwaveConnection";
import { useMotionStability } from "../hooks/useMotionStability";
import { useMeditationGuidance } from "../hooks/useMeditationGuidance";
import { useSaveMeditationReport } from "../hooks/useSaveMeditationReport"; // ✅
import { MusicPanel } from "../components/MusicPanel";
import { RoundIndicator } from "../components/RoundIndicator";
import { TimerDisplay } from "../components/TimerDisplay";
import { GuidanceText } from "../components/GuidanceText";
import { BrainwaveStatus } from "../components/BrainwaveStatus";
import {
  THEME_QUERIES,
  DEFAULT_THEME,
  TOTAL_ROUNDS,
} from "../constants/meditationConstants";

import TestSaveButton from "../components/TestSaveButton";  //테스트용

export default function MeditationSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const durationMin = parseInt(searchParams.get("duration") || "3");
  const theme = searchParams.get("theme") || DEFAULT_THEME;

  // ── Custom Hooks ──
  const timer = useMeditationTimer({ durationMin, totalRounds: TOTAL_ROUNDS });
  const music = useMeditationMusic(theme);
  const brainwave = useBrainwaveConnection();
  const { isUnstable, unstableCount } = useMotionStability(); // ✅ unstableCount 추가
  const guidance = useMeditationGuidance(theme);

  // ── Local State ──
  const [showMusicPanel, setShowMusicPanel] = useState(false);

  // ✅ 명상 완료 시 자동 저장 → /reports 이동
  useSaveMeditationReport({
    isFinished:       timer.isFinished,
    durationMin,
    totalRounds:      TOTAL_ROUNDS,
    theme,
    unstableCount,
    brainwaveMetrics: brainwave.brainwaveMetrics, // { attention, meditation, signal }
    onSaved: () => {
      music.stopMusic();
      navigate("/reports", { state: { isJustFinished: true } });
    },
  });

  // ── Derived ──
  const themeInfo = THEME_QUERIES[theme] ?? THEME_QUERIES[DEFAULT_THEME];

  return (
    <main className={styles.root}>
      <div className={styles.ambientGlow} />

      {/* Back */}
      <button
        className={styles.backBtn}
        aria-label="Go back"
        onClick={() => { music.stopMusic(); navigate("/meditationsetup"); }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      <TestSaveButton />

      {/* Music toggle */}
      <button
        className={styles.musicToggleBtn}
        onClick={() => setShowMusicPanel((v) => !v)}
        aria-label="Toggle music panel"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
        <span>{themeInfo.emoji}</span>
        {music.musicPlaying && <span className={styles.musicActiveDot} />}
      </button>

      {showMusicPanel && (
        <MusicPanel
          themeInfo={themeInfo}
          sounds={music.sounds}
          soundError={music.soundError}
          currentSound={music.currentSound}
          musicPlaying={music.musicPlaying}
          volume={music.volume}
          onPlaySound={music.playSound}
          onToggleMusic={music.toggleMusic}
          onStopMusic={music.stopMusic}
          onVolumeChange={music.setVolume}
        />
      )}

      {/* Session Layout */}
      <div className={styles.sessionLayout}>
        <button
          className={`${styles.sideBtn} ${!timer.canPrev ? styles.sideBtnHidden : ""}`}
          aria-label="Previous round"
          onClick={() => timer.goToRound(timer.currentRound - 1)}
          disabled={!timer.canPrev}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className={styles.sideBtnLabel}>Round {timer.currentRound - 1}</span>
        </button>

        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>Meditation</h1>
              <BrainwaveStatus
                connected={brainwave.brainwaveConnected}
                metrics={brainwave.brainwaveMetrics}
              />
            </div>
          </header>

          <RoundIndicator
            currentRound={timer.currentRound}
            totalRounds={TOTAL_ROUNDS}
            onGoToRound={timer.goToRound}
          />

          <div className={styles.orbWrap}>
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
            <div className={`${styles.orb} ${timer.isFinished ? styles.orbFinished : ""}`}>
              <div className={styles.orbGlow} />
            </div>
          </div>

          <GuidanceText
            isFinished={timer.isFinished}
            isLoading={guidance.guidanceLoading}
            isUnstable={isUnstable}
            brainwaveState={brainwave.brainwaveState}
            guidances={guidance.guidances}
            guidanceIndex={guidance.guidanceIndex}
          />

          <TimerDisplay
            remaining={timer.remaining}
            total={timer.roundSeconds}
            progress={timer.progress}
          />
        </div>

        <button
          className={`${styles.sideBtn} ${!timer.canNext ? styles.sideBtnHidden : ""}`}
          aria-label="Next round"
          onClick={() => timer.goToRound(timer.currentRound + 1)}
          disabled={!timer.canNext}
        >
          <span className={styles.sideBtnLabel}>Round {timer.currentRound + 1}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </main>
  );
}