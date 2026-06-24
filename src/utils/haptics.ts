// KitCrush — Haptic Feedback (Vibration API)

export function vibrate(pattern: number | number[]) {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibrate not supported
  }
}

export const HAPTIC = {
  light: () => vibrate(10),
  medium: () => vibrate(25),
  heavy: () => vibrate(50),
  match: () => vibrate([15, 30, 15]),
  combo: (level: number) => vibrate([20, 20, 20, 20, 30 + level * 10]),
  powerUp: () => vibrate([30, 50, 30, 50, 60]),
  gameOver: (won: boolean) => vibrate(won ? [50, 100, 50, 100, 100] : [100, 50, 100]),
  invalid: () => vibrate([40, 30, 40]),
};
