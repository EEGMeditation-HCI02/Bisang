import { useState, useEffect, useRef, useCallback } from "react";

export interface FreesoundSound {
  id: number;
  name: string;
  duration: number;
  avg_rating: number;
  previews: { "preview-hq-mp3": string };
}

interface UseMusicReturn {
  sounds: FreesoundSound[];
  soundError: string;
  currentSound: FreesoundSound | null;
  musicPlaying: boolean;
  volume: number;
  playSound: (sound: FreesoundSound) => Promise<void>;
  toggleMusic: () => void;
  stopMusic: () => void;
  setVolume: (volume: number) => void;
}

const FREESOUND_API_KEY = "nHjwslKbm47PYH8dMiyPau4kFdgSBvTIHjpRITnA";

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
  const data = await res.json();
  return data.results ?? [];
}

export function useMeditationMusic(theme: string): UseMusicReturn {
  const [sounds, setSounds] = useState<FreesoundSound[]>([]);
  const [soundError, setSoundError] = useState("");
  const [currentSound, setCurrentSound] = useState<FreesoundSound | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayed = useRef(false);

  // Audio element 초기화
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const onPlay = () => setMusicPlaying(true);
    const onPause = () => setMusicPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  // 볼륨 업데이트
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // 음악 로드
  useEffect(() => {
    let isMounted = true;
    autoPlayed.current = false;

    const loadSounds = async () => {
      setSounds([]);
      setSoundError("");
      try {
        const results = await fetchSounds(theme);
        if (isMounted) {
          setSounds(results);
          // 첫 번째 곡 자동재생 (한 번만)
          if (results.length > 0 && !autoPlayed.current) {
            autoPlayed.current = true;
            const first = results[0];
            setCurrentSound(first);
            setTimeout(() => {
              const audio = audioRef.current;
              if (!audio) return;
              audio.src = first.previews["preview-hq-mp3"];
              audio.loop = true;
              audio.play().catch((e) => console.warn("Auto-play blocked:", e));
            }, 100);
          }
        }
      } catch (e: Error | unknown) {
        if (isMounted) {
          setSoundError(
            e instanceof Error ? e.message : "Failed to load sounds",
          );
        }
      }
    };

    loadSounds();

    return () => {
      isMounted = false;
    };
  }, [theme]);

  const playSound = useCallback(async (sound: FreesoundSound) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = sound.previews["preview-hq-mp3"];
    audio.loop = true;
    setCurrentSound(sound);
    try {
      await audio.play();
    } catch (e) {
      console.error("Playback failed", e);
    }
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSound) return;
    if (audio.paused) {
      audio.play().catch((e) => console.error("Playback failed", e));
    } else {
      audio.pause();
    }
  }, [currentSound]);

  const stopMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    setCurrentSound(null);
    setMusicPlaying(false);
  }, []);

  return {
    sounds,
    soundError,
    currentSound,
    musicPlaying,
    volume,
    playSound,
    toggleMusic,
    stopMusic,
    setVolume,
  };
}
