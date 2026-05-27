import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./css/MeditationPage.module.css"; // 기존 스타일 재사용
import testStyles from "./css/TestSessionPage.module.css";
import { useMeditationTimer } from "../hooks/useMeditationTimer";
import { useMeditationMusic } from "../hooks/useMeditationMusic";
import { useBrainwaveConnection } from "../hooks/useBrainwaveConnection";
import { useMotionStability } from "../hooks/useMotionStability";
import { useMeditationGuidance } from "../hooks/useMeditationGuidance";
import { useSaveMeditationReport } from "../hooks/useSaveMeditationReport";
import { usePoseAnalysis } from "../hooks/usePoseAnalysis";
import { useMeditationStore, type SessionDetail } from "../store/useMeditationStore";
import { MusicPanel } from "../components/MusicPanel";
import { RoundIndicator } from "../components/RoundIndicator";
import { TimerDisplay } from "../components/TimerDisplay";
import { GuidanceText } from "../components/GuidanceText";
import { BrainwaveStatus } from "../components/BrainwaveStatus";
import {
  THEME_QUERIES,
  DEFAULT_THEME,
} from "../constants/meditationConstants";
import { playDynamicGuidance } from "../utils/audioUtils";
import { useUser } from "../contexts/userContextHelpers";

// ── 테스트 세션 고정값 ──
const TEST_DURATION_MIN = 1;  // 1분
const TEST_TOTAL_ROUNDS = 1;  // 1라운드

export default function TestSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = searchParams.get("theme") || DEFAULT_THEME;
  const { user } = useUser();

  // ── Custom Hooks (MeditationPage와 동일) ──
  const timer = useMeditationTimer({
    durationMin: TEST_DURATION_MIN,
    totalRounds: TEST_TOTAL_ROUNDS,
  });

  const themeQuery = THEME_QUERIES[theme]?.query ?? THEME_QUERIES[DEFAULT_THEME].query;
  const music = useMeditationMusic(themeQuery);
  const brainwave = useBrainwaveConnection();
  const { isUnstable, unstableCount } = useMotionStability();
  const guidance = useMeditationGuidance(theme);
  const { startSession, stopSession, isBadPosture, isEyeClosed } = usePoseAnalysis();

  // ── Zustand Store ──
  const setLatestSessionResult = useMeditationStore((s) => s.setLatestSessionResult);

  // ── Local State ──
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);

  // Brainwave 누적
  const brainwaveHistoryRef = useRef<{ attention: number; meditation: number }[]>([]);

  // ── Pose Analysis 시작 ──
  useEffect(() => {
    const init = async () => {
      try {
        await startSession();
      } catch (err) {
        console.error("❌ Pose analysis start failed:", err);
      }
    };
    init();
  }, [startSession]);

  // ── Brainwave 수집 ──
  useEffect(() => {
    if (timer.isPlaying && !timer.isFinished) {
      brainwaveHistoryRef.current.push({
        attention: brainwave.brainwaveMetrics.attention,
        meditation: brainwave.brainwaveMetrics.meditation,
      });
    }
  }, [brainwave.brainwaveMetrics, timer.isPlaying, timer.isFinished]);

  // ── 세션 완료 시 점수 계산 ──
  useEffect(() => {
    if (timer.isFinished && !sessionDetail) {
      const poseRes = stopSession();

      const validHistory = brainwaveHistoryRef.current.filter(
        (m) => m.attention > 0 || m.meditation > 0
      );
      const attentionAvg = validHistory.length > 0
        ? Math.round(validHistory.reduce((s, h) => s + h.attention, 0) / validHistory.length)
        : 70;
      const meditationAvg = validHistory.length > 0
        ? Math.round(validHistory.reduce((s, h) => s + h.meditation, 0) / validHistory.length)
        : 70;

      const postureScore = poseRes.postureScore;
      const eyeClosedRatio = poseRes.durationMs > 0
        ? poseRes.eyeClosedMs / poseRes.durationMs
        : 0.8;
      const eyeClosedScore = Math.min(100, Math.round(eyeClosedRatio * 100 * (1 / 0.9)));

      const finalScore = Math.min(100, Math.max(0, Math.round(
        postureScore * 0.3 +
        eyeClosedScore * 0.3 +
        meditationAvg * 0.2 +
        attentionAvg * 0.2
      )));

      const detail: SessionDetail = {
        postureScore,
        eyeClosedMs: poseRes.eyeClosedMs,
        eyeOpenMs: poseRes.eyeOpenMs,
        badPostureRatio: poseRes.badPostureRatio,
        blinkCount: poseRes.blinkCount,
        durationMs: poseRes.durationMs,
        unstableCount,
        attentionAvg,
        meditationAvg,
        score: finalScore,
      };

      setSessionDetail(detail);
      setLatestSessionResult(detail);
    }
  }, [timer.isFinished, stopSession, unstableCount, setLatestSessionResult, sessionDetail]);

  // ── 자동 저장 → /reports 이동 ──
  useSaveMeditationReport({
    isFinished: timer.isFinished,
    durationMin: TEST_DURATION_MIN,
    totalRounds: TEST_TOTAL_ROUNDS,
    theme,
    sessionDetail,
    onSaved: () => {
      music.stopMusic();
      navigate("/reports", { state: { isJustFinished: true, theme } });
    },
  });

  // ── TTS ──
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const stopTTS = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
  };

  useEffect(() => {
    if (!timer.isPlaying || timer.isFinished || guidance.guidanceLoading) {
      stopTTS();
      return;
    }
    const currentText = guidance.guidances[guidance.guidanceIndex];
    if (!currentText) return;

    const playTTS = async () => {
      stopTTS();
      try {
        const voiceId = user?.audio_guidance || "sunhi-calm";
        const audioObj = await playDynamicGuidance(currentText, voiceId);
        if (timer.isPlaying) {
          activeAudioRef.current = audioObj;
          audioObj.play();
        }
      } catch (err) {
        console.warn("⚠️ TTS failed:", err);
      }
    };
    playTTS();
    return () => { stopTTS(); };
  }, [guidance.guidanceIndex, timer.isPlaying, timer.isFinished, guidance.guidanceLoading, user?.audio_guidance]);

  // ── Derived ──
  const themeInfo = THEME_QUERIES[theme] ?? THEME_QUERIES[DEFAULT_THEME];

  let correctionText = "";
  if (!timer.isFinished && !guidance.guidanceLoading && timer.isPlaying) {
    if (isUnstable)                          correctionText = "Keep your body still";
    else if (isBadPosture)                   correctionText = "Align your posture";
    else if (!isEyeClosed)                   correctionText = "Gently close your eyes";
    else if (brainwave.brainwaveState === "unstable") correctionText = "Return to your breath";
  }

  return (
    <main className={styles.root}>
      <div className={styles.ambientGlow} />

      {/* Back */}
      <button
        className={styles.backBtn}
        aria-label="Go back"
        onClick={() => { music.stopMusic(); stopTTS(); navigate("/meditationsetup"); }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

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

      {/* Session Layout — 사이드 버튼 없음 (1라운드) */}
      <div className={styles.sessionLayout}>
        {/* 왼쪽 빈 자리 유지 (레이아웃 대칭) */}
        <div className={styles.sideBtnHidden} style={{ width: "3.75rem" }} />

        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>Test Session</h1>
              <BrainwaveStatus
                connected={brainwave.brainwaveConnected}
                metrics={brainwave.brainwaveMetrics}
              />
            </div>
          </header>

          <RoundIndicator
            currentRound={1}
            totalRounds={1}
            onGoToRound={() => {}}
          />

          <div className={styles.orbWrap}>
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
            <div className={`${styles.orb} ${timer.isFinished ? styles.orbFinished : ""}`}>
              <div className={styles.orbGlow} />
            </div>
          </div>

          {/* Correction badge */}
          <div className={styles.correctionContainer}>
            {correctionText ? (
              <div className={styles.correctionBadge}>
                <svg className={styles.warningIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{correctionText}</span>
              </div>
            ) : (
              <div className={styles.correctionEmpty} />
            )}
          </div>

          <GuidanceText
            isFinished={timer.isFinished}
            isLoading={guidance.guidanceLoading}
            guidances={guidance.guidances}
            guidanceIndex={guidance.guidanceIndex}
          />

          <TimerDisplay
            remaining={timer.remaining}
            total={timer.roundSeconds}
            progress={timer.progress}
          />
        </div>

        {/* 오른쪽 빈 자리 */}
        <div className={styles.sideBtnHidden} style={{ width: "3.75rem" }} />
      </div>
    </main>
  );
}