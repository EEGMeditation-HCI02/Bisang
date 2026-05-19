export interface ThemeConfig {
  label: string;
  query: string;
  emoji: string;
}

export const THEME_QUERIES: Record<string, ThemeConfig> = {
  "self-esteem": {
    label: "Self-esteem",
    query: "peaceful piano meditation ambient",
    emoji: "Self-esteem",
  },
  relationships: {
    label: "Relationships",
    query: "soft guitar meditation calm ambient",
    emoji: "Relationships",
  },
  rest: {
    label: "Rest",
    query: "sleep relaxation ambient nature",
    emoji: "Rest",
  },
  focus: {
    label: "Focus",
    query: "binaural focus concentration ambient",
    emoji: "Focus",
  },
  calm: {
    label: "Calm",
    query: "rain forest nature ambient meditation",
    emoji: "Calm",
  },
  free: {
    label: "Free",
    query: "ambient meditation nature soundscape",
    emoji: "Free",
  },
};

export const DEFAULT_THEME = "calm";
export const TOTAL_ROUNDS = 4;
