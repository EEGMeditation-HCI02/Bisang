export function formatTime(sec: number): string {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function calculateProgress(
  elapsed: number,
  roundSeconds: number,
): number {
  return (elapsed / roundSeconds) * 100;
}

export function calculateRemaining(
  elapsed: number,
  roundSeconds: number,
): number {
  return roundSeconds - elapsed;
}
