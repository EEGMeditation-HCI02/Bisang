import type { FC } from "react";
import type { FreesoundSound } from "../hooks/useMeditationMusic";
import { formatTime } from "../utils/timeUtils";
import styles from "../pages/css/MeditationPage.module.css";

interface ThemeInfo {
  label: string;
  query: string;
  emoji: string;
}

interface MusicPanelProps {
  themeInfo: ThemeInfo;
  sounds: FreesoundSound[];
  soundError: string;
  currentSound: FreesoundSound | null;
  musicPlaying: boolean;
  volume: number;
  onPlaySound: (sound: FreesoundSound) => void;
  onToggleMusic: () => void;
  onStopMusic: () => void;
  onVolumeChange: (volume: number) => void;
}

export const MusicPanel: FC<MusicPanelProps> = ({
  themeInfo,
  sounds,
  soundError,
  currentSound,
  musicPlaying,
  volume,
  onPlaySound,
  onToggleMusic,
  onStopMusic,
  onVolumeChange,
}) => {
  return (
    <div className={styles.musicPanel}>
      <div className={styles.musicPanelHeader}>
        <span className={styles.musicPanelTitle}>
          {themeInfo.emoji} {themeInfo.label} Music
        </span>
        <div className={styles.volumeRow}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            opacity="0.5"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className={styles.volumeSlider}
          />
        </div>
      </div>

      {currentSound && (
        <div className={styles.nowPlaying}>
          <div className={styles.nowPlayingInfo}>
            <span
              className={`${styles.nowPlayingDot} ${musicPlaying ? styles.nowPlayingDotActive : ""}`}
            />
            <span className={styles.nowPlayingName}>{currentSound.name}</span>
          </div>
          <div className={styles.nowPlayingControls}>
            <button className={styles.musicCtrlBtn} onClick={onToggleMusic}>
              {musicPlaying ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button className={styles.musicCtrlBtn} onClick={onStopMusic}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className={styles.soundList}>
        {soundError && (
          <p className={styles.soundStatusError}>⚠ {soundError}</p>
        )}
        {!soundError && sounds.length === 0 && (
          <p className={styles.soundStatus}>Loading music...</p>
        )}
        {sounds.map((sound) => (
          <button
            key={sound.id}
            className={`${styles.soundItem} ${
              currentSound?.id === sound.id ? styles.soundItemActive : ""
            }`}
            onClick={() => onPlaySound(sound)}
          >
            <div className={styles.soundItemLeft}>
              <span className={styles.soundItemPlay}>
                {currentSound?.id === sound.id && musicPlaying ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
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
  );
};
