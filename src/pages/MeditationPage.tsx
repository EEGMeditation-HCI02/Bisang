import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./css/MeditationPage.module.css";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface FreesoundSound {
  id: number;
  name: string;
  duration: number;
  avg_rating: number;
  previews: { "preview-hq-mp3": string };
}

interface FreesoundResponse {
  results: FreesoundSound[];
}

// ─────────────────────────────────────────────
// 명상 테마별 Freesound 검색어
// ─────────────────────────────────────────────
const THEME_QUERIES: Record<string, { label: string; query: string; emoji: string }> = {
  "self-esteem": { label: "Self-esteem", query: "peaceful piano meditation ambient",     emoji: "💛" },
  relationships:  { label: "Relationships", query: "soft guitar meditation calm ambient", emoji: "🤝" },
  rest:           { label: "Rest",          query: "sleep relaxation ambient nature",     emoji: "🌙" },
  focus:          { label: "Focus",         query: "binaural focus concentration ambient",emoji: "🎯" },
  calm:           { label: "Calm",          query: "rain forest nature ambient meditation",emoji: "🌿" },
  free:           { label: "Free",          query: "ambient meditation nature soundscape",emoji: "✨" },
};

const DEFAULT_THEME = "calm";

// API 키 한 곳에서만 관리
const FREESOUND_API_KEY = "nHjwslKbm47PYH8dMiyPau4kFdgSBvTIHjpRITnA";

const TOTAL_ROUNDS = 4;

// ─────────────────────────────────────────────
// Freesound fetch helper
// ─────────────────────────────────────────────
async function fetchSounds(query: string): Promise<FreesoundSound[]> {
  const params = new URLSearchParams({
    query,
    token: FREESOUND_API_KEY,
    fields: "id,name,duration,avg_rating,previews",
    page_size: "6",
    filter: "duration:[30 TO 600]",
    sort: "rating_desc",
  });
  const res = await fetch(`https://freesound.org/apiv2/search/text/?${params}`);
  if (!res.ok) throw new Error(`Freesound error: ${res.status}`);
  const data: FreesoundResponse = await res.json();
  return data.results ?? [];
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function MeditationSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const durationMin   = parseInt(searchParams.get("duration") || "3");
  const theme         = searchParams.get("theme") || DEFAULT_THEME;
  const ROUND_SECONDS = durationMin * 60;

  // ── Timer state ──
  const [currentRound, setCurrentRound] = useState(1);
  const [elapsed,      setElapsed]      = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(true);
  const [isFinished,   setIsFinished]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Music state ──
  const [sounds,       setSounds]       = useState<FreesoundSound[]>([]);
  const [soundLoading, setSoundLoading] = useState(false);
  const [soundError,   setSoundError]   = useState("");
  const [currentSound, setCurrentSound] = useState<FreesoundSound | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [volume,       setVolume]       = useState(0.6);
  const [showMusicPanel, setShowMusicPanel] = useState(false);

  // ✅ useRef는 반드시 컴포넌트 최상위에서 선언
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const autoPlayed  = useRef(false);

  // ─────────────────────────────────────────────
  // Audio element 초기화
  // ─────────────────────────────────────────────
  useEffect(() => {
    const audio  = new Audio();
    audio.loop   = true;
    audio.volume = volume;
    audioRef.current = audio;

    const onPlay  = () => setMusicPlaying(true);
    const onPause = () => setMusicPlaying(false);
    audio.addEventListener("play",  onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("play",  onPlay);
      audio.removeEventListener("pause", onPause);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ─────────────────────────────────────────────
  // Freesound 로드 + 첫 곡 자동재생
  // ─────────────────────────────────────────────
  useEffect(() => {
    const themeInfo = THEME_QUERIES[theme] ?? THEME_QUERIES[DEFAULT_THEME];
    setSoundLoading(true);
    setSoundError("");
    setSounds([]);
    autoPlayed.current = false; // 테마 바뀌면 리셋

    fetchSounds(themeInfo.query)
      .then((results) => {
        setSounds(results);
        // ✅ 첫 번째 곡 자동재생 (한 번만)
        if (results.length > 0 && !autoPlayed.current) {
          autoPlayed.current = true;
          const first = results[0];
          setCurrentSound(first);
          setTimeout(() => {
            const audio = audioRef.current;
            if (!audio) return;
            audio.src  = first.previews["preview-hq-mp3"];
            audio.loop = true;
            audio.play().catch((e) => console.warn("Auto-play blocked:", e));
          }, 100);
        }
      })
      .catch((e: Error) => setSoundError(e.message))
      .finally(() => setSoundLoading(false));
  }, [theme]);

  // ─────────────────────────────────────────────
  // Timer
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (isFinished) return;
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= ROUND_SECONDS) {
            clearInterval(intervalRef.current!);
            if (currentRound < TOTAL_ROUNDS) {
              setTimeout(() => { setCurrentRound((r) => r + 1); setElapsed(0); }, 800);
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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentRound, ROUND_SECONDS, isFinished]);

  // ─────────────────────────────────────────────
  // Music controls
  // ─────────────────────────────────────────────
  const playSound = useCallback(async (sound: FreesoundSound) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src  = sound.previews["preview-hq-mp3"];
    audio.loop = true;
    setCurrentSound(sound);
    try { await audio.play(); } catch (e) { console.error("Playback failed", e); }
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSound) return;
    audio.paused ? audio.play() : audio.pause();
  }, [currentSound]);

  const stopMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    setCurrentSound(null);
    setMusicPlaying(false);
  }, []);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const remaining = ROUND_SECONDS - elapsed;
  const progress  = (elapsed / ROUND_SECONDS) * 100;

  const skip = (delta: number) =>
    setElapsed((prev) => Math.min(Math.max(prev + delta, 0), ROUND_SECONDS));

  const goToRound = (round: number) => {
    if (round < 1 || round > TOTAL_ROUNDS) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentRound(round);
    setElapsed(0);
    setIsFinished(false);
    setIsPlaying(true);
  };

  const canPrev   = currentRound > 1;
  const canNext   = currentRound < TOTAL_ROUNDS;
  const themeInfo = THEME_QUERIES[theme] ?? THEME_QUERIES[DEFAULT_THEME];

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <main className={styles.root}>
      <div className={styles.ambientGlow} />

      {/* Back */}
      <button className={styles.backBtn} aria-label="Go back"
        onClick={() => { stopMusic(); navigate("/meditationsetup"); }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* Music toggle */}
      <button className={styles.musicToggleBtn}
        onClick={() => setShowMusicPanel((v) => !v)} aria-label="Toggle music panel">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
        <span>{themeInfo.emoji}</span>
        {musicPlaying && <span className={styles.musicActiveDot} />}
      </button>

      {/* Quote */}
      <div className={styles.quote}>
        "Silence is not the absence of sound,<br />but the presence of focus."
      </div>

      {/* ── Music Panel ── */}
      {showMusicPanel && (
        <div className={styles.musicPanel}>
          <div className={styles.musicPanelHeader}>
            <span className={styles.musicPanelTitle}>{themeInfo.emoji} {themeInfo.label} 음악</span>
            <div className={styles.volumeRow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input type="range" min="0" max="1" step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className={styles.volumeSlider}
              />
            </div>
          </div>

          {currentSound && (
            <div className={styles.nowPlaying}>
              <div className={styles.nowPlayingInfo}>
                <span className={`${styles.nowPlayingDot} ${musicPlaying ? styles.nowPlayingDotActive : ""}`} />
                <span className={styles.nowPlayingName}>{currentSound.name}</span>
              </div>
              <div className={styles.nowPlayingControls}>
                <button className={styles.musicCtrlBtn} onClick={toggleMusic}>
                  {musicPlaying
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  }
                </button>
                <button className={styles.musicCtrlBtn} onClick={stopMusic}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z" /></svg>
                </button>
              </div>
            </div>
          )}

          <div className={styles.soundList}>
            {soundLoading && <p className={styles.soundStatus}>불러오는 중...</p>}
            {soundError && !soundLoading && <p className={styles.soundStatusError}>⚠ {soundError}</p>}
            {!soundLoading && !soundError && sounds.length === 0 && (
              <p className={styles.soundStatus}>결과 없음</p>
            )}
            {!soundLoading && sounds.map((sound) => (
              <button
                key={sound.id}
                className={`${styles.soundItem} ${currentSound?.id === sound.id ? styles.soundItemActive : ""}`}
                onClick={() => playSound(sound)}
              >
                <div className={styles.soundItemLeft}>
                  <span className={styles.soundItemPlay}>
                    {currentSound?.id === sound.id && musicPlaying
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    }
                  </span>
                  <span className={styles.soundItemName}>{sound.name}</span>
                </div>
                <div className={styles.soundItemMeta}>
                  <span>{formatTime(Math.floor(sound.duration))}</span>
                  <span>★ {sound.avg_rating.toFixed(1)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Session Layout ── */}
      <div className={styles.sessionLayout}>

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

        <div className={styles.card}>
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

          <div className={styles.roundIndicator}>
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <button
                key={i}
                className={`${styles.roundDot} ${
                  i + 1 < currentRound  ? styles.roundDotDone
                  : i + 1 === currentRound ? styles.roundDotActive
                  : styles.roundDotPending
                }`}
                onClick={() => goToRound(i + 1)}
                aria-label={`Go to round ${i + 1}`}
              />
            ))}
            <span className={styles.roundLabel}>Round {currentRound} / {TOTAL_ROUNDS}</span>
          </div>

          <div className={styles.orbWrap}>
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
            <div className={`${styles.orb} ${isFinished ? styles.orbFinished : ""}`}>
              <div className={styles.orbGlow} />
            </div>
          </div>

          <p className={styles.subtitle}>
            {isFinished ? "Session complete 🎉" : "Take a deep breath"}
          </p>

          <div className={styles.timerSection}>
            <div className={styles.timerDisplay}>
              <span className={styles.timerElapsed}>{formatTime(remaining)}</span>
              <span className={styles.timerDivider}>/</span>
              <span className={styles.timerTotal}>{formatTime(ROUND_SECONDS)}</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            {!isFinished ? (
              <div className={styles.controls}>
                <button className={styles.controlBtn} aria-label="Rewind 10s" onClick={() => skip(-10)}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    <text x="8.5" y="15.5" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">10</text>
                  </svg>
                </button>
                <button className={styles.playPauseBtn} onClick={() => setIsPlaying((p) => !p)}> 
                  {isPlaying
                    ? <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    : <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  }
                </button>
                <button className={styles.controlBtn} aria-label="Forward 10s" onClick={() => skip(10)}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z" />
                    <text x="8.5" y="15.5" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">10</text>
                  </svg>
                </button>
              </div>
            ) : (
              <button className={styles.finishBtn} onClick={() => { stopMusic(); navigate("/dashboard"); }}>
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

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