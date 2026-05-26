import { create } from "zustand";

export interface SessionDetail {
  postureScore: number;
  eyeClosedMs: number;
  eyeOpenMs: number;
  badPostureRatio: number;
  blinkCount: number;
  durationMs: number;
  unstableCount: number;
  attentionAvg: number;
  meditationAvg: number;
  score: number;
}

interface MeditationState {
  latestSessionResult: SessionDetail | null;
  setLatestSessionResult: (result: SessionDetail | null) => void;
}

export const useMeditationStore = create<MeditationState>((set) => ({
  latestSessionResult: null,
  setLatestSessionResult: (result) => set({ latestSessionResult: result }),
}));
