import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./css/MeditationPage.module.css";
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
  TOTAL_ROUNDS,
} from "../constants/meditationConstants";
import { playDynamicGuidance } from "../utils/audioUtils";
import { useUser } from "../contexts/userContextHelpers";

export default function MeditationSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const durationMin = parseInt(searchParams.get("duration") || "3");
  const theme = searchParams.get("theme") || DEFAULT_THEME;

  const { user } = useUser();

  // ── Custom Hooks ──
  const timer = useMeditationTimer({ durationMin, totalRounds: TOTAL_ROUNDS });
  const themeQuery = THEME_QUERIES[theme]?.query ?? THEME_QUERIES[DEFAULT_THEME].query;
  const music = useMeditationMusic(themeQuery);
  const brainwave = useBrainwaveConnection();
  const { isUnstable, unstableCount } = useMotionStability();
  const guidance = useMeditationGuidance(theme);
  const { startSession, stopSession, isBadPosture, isEyeClosed } = usePoseAnalysis();

  // ── Zustand Store ──
  const setLatestSessionResult = useMeditationStore((state) => state.setLatestSessionResult);

  // ── Local State & Refs ──
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);

  // Brainwave metrics history array to compute session averages
  const brainwaveHistoryRef = useRef<{ attention: number; meditation: number }[]>([]);
  // 현재 재생 중인 TTS 오디오 객체 추적
  const currentTtsAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Start Pose Analysis on Mount ──
  useEffect(() => {
    const initPose = async () => {
      try {
        console.log("🎥 Starting pose analysis session...");
        await startSession();
      } catch (err) {
        console.error("❌ Failed to start camera/pose analysis:", err);
      }
    };
    initPose();
  }, [startSession]);

  // ── Accumulate Brainwave Metrics ──
  useEffect(() => {
    if (timer.isPlaying && !timer.isFinished) {
      brainwaveHistoryRef.current.push({
        attention: brainwave.brainwaveMetrics.attention,
        meditation: brainwave.brainwaveMetrics.meditation,
      });
    }
  }, [brainwave.brainwaveMetrics, timer.isPlaying, timer.isFinished]);

  // ── TTS 자동 재생 로직 추가 ──
  useEffect(() => {
    // 로딩 중, 명상 종료, 일시정지 상태이거나 멘트가 없으면 재생하지 않음
    if (guidance.guidanceLoading || timer.isFinished || !timer.isPlaying || guidance.guidances.length === 0) {
      return;
    }

    const currentText = guidance.guidances[guidance.guidanceIndex];
    if (!currentText) return;

    if (currentTtsAudioRef.current && !currentTtsAudioRef.current.paused) return; // ← 추가

    let isSubscribed = true;

    const playGuidanceAudio = async () => {
      try {
        if (currentTtsAudioRef.current) {
          currentTtsAudioRef.current.pause();
          currentTtsAudioRef.current.currentTime = 0;
        }

        const audio = await playDynamicGuidance(currentText, "default");
        if (!isSubscribed) return;

        currentTtsAudioRef.current = audio;
        await audio.play();
      } catch (error) {
        console.error("❌ TTS 오디오 재생 실패:", error);
      }
    };

    playGuidanceAudio();

    return () => {
      isSubscribed = false;
      if (currentTtsAudioRef.current) {
        currentTtsAudioRef.current.pause();
      }
    };
  }, [guidance.guidanceIndex, timer.isFinished, timer.isPlaying, guidance.guidanceLoading]); 

  // ── On Meditation Finished: Stop Analysis and Calculate Scores ──
  useEffect(() => {
    if (timer.isFinished && !sessionDetail) {
      console.log("🧘 Meditation session finished. Calculating final scores...");
      const poseRes = stopSession();
      console.log("📷 Pose analysis results:", poseRes);

      // Compute brainwave averages
      const validHistory = brainwaveHistoryRef.current.filter(
        (m) => m.attention > 0 || m.meditation > 0
      );
      const attentionAvg = validHistory.length > 0
        ? Math.round(validHistory.reduce((sum, h) => sum + h.attention, 0) / validHistory.length)
        : 70; // baseline
      const meditationAvg = validHistory.length > 0
        ? Math.round(validHistory.reduce((sum, h) => sum + h.meditation, 0) / validHistory.length)
        : 70; // baseline

      // Compute components
      const postureScore = poseRes.postureScore;
      const eyeClosedRatio = poseRes.durationMs > 0
        ? poseRes.eyeClosedMs / poseRes.durationMs
        : 0.8;
      const eyeClosedScore = Math.min(100, Math.round(eyeClosedRatio * 100 * (1 / 0.9)));

      // Composite Score: Posture (30%) + Eye Closure (30%) + Meditation (20%) + Attention (20%)
      const finalScore = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            postureScore * 0.3 +
            eyeClosedScore * 0.3 +
            meditationAvg * 0.2 +
            attentionAvg * 0.2
          )
        )
      );

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

  // ✅ Meditation Auto-save on Finish → navigates to /reports
  useSaveMeditationReport({
    isFinished: timer.isFinished,
    durationMin,
    totalRounds: TOTAL_ROUNDS,
    theme,
    sessionDetail,
    onSaved: () => {
      music.stopMusic();
      navigate("/reports", { state: { isJustFinished: true, theme } });
    },
  });

  // ── TTS playback for meditation guide subtitles ──
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
        console.log(`🗣️ Speaking guidance: "${currentText}" with voice: ${voiceId}`);
        const audioObj = await playDynamicGuidance(currentText, voiceId);
        
        if (timer.isPlaying) {
          activeAudioRef.current = audioObj;
          audioObj.play();
        }
      } catch (err) {
        console.warn("⚠️ TTS playback failed:", err);
      }
    };

    playTTS();

    return () => {
      stopTTS();
    };
  }, [guidance.guidanceIndex, guidance.guidances, timer.isPlaying, timer.isFinished, guidance.guidanceLoading, user?.audio_guidance]);

  // ── Derived ──
  const themeInfo = THEME_QUERIES[theme] ?? THEME_QUERIES[DEFAULT_THEME];

  let correctionText = "";
  if (!timer.isFinished && !guidance.guidanceLoading && timer.isPlaying) {
    if (isUnstable) {
      correctionText = "Keep your body still";
    } else if (isBadPosture) {
      correctionText = "Align your posture";
    } else if (!isEyeClosed) {
      correctionText = "Gently close your eyes";
    } else if (brainwave.brainwaveState === "unstable") {
      correctionText = "Return to your breath";
    }
  }

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

          {/* Correction / Stability warning badge */}
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