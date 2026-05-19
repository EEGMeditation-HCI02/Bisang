import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerProps {
  durationMin: number;
  totalRounds: number;
}

interface UseTimerReturn {
  currentRound: number;
  elapsed: number;
  isPlaying: boolean;
  isFinished: boolean;
  togglePlay: () => void;
  goToRound: (round: number) => void;
  remaining: number;
  progress: number;
  canPrev: boolean;
  canNext: boolean;
  roundSeconds: number;
}

export function useMeditationTimer({
  durationMin,
  totalRounds,
}: UseTimerProps): UseTimerReturn {
  const roundSeconds = durationMin * 60;
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
          if (next >= roundSeconds) {
            clearInterval(intervalRef.current!);
            if (currentRound < totalRounds) {
              setTimeout(() => {
                setCurrentRound((r) => r + 1);
                setElapsed(0);
              }, 800);
            } else {
              setIsFinished(true);
            }
            return roundSeconds;
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
  }, [isPlaying, currentRound, roundSeconds, totalRounds, isFinished]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const goToRound = useCallback(
    (round: number) => {
      if (round < 1 || round > totalRounds) return;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentRound(round);
      setElapsed(0);
      setIsFinished(false);
      setIsPlaying(true);
    },
    [totalRounds],
  );

  const remaining = roundSeconds - elapsed;
  const progress = (elapsed / roundSeconds) * 100;
  const canPrev = currentRound > 1;
  const canNext = currentRound < totalRounds;

  return {
    currentRound,
    elapsed,
    isPlaying,
    isFinished,
    togglePlay,
    goToRound,
    remaining,
    progress,
    canPrev,
    canNext,
    roundSeconds,
  };
}
