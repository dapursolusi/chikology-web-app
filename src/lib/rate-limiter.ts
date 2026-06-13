const BURST_LIMIT = 3;
const MIN_SPACING_MS = 60 * 1000;
const COOLDOWN_MS = 60 * 60 * 1000;

type BurstState = {
  burstCount: number;
  lastScanTime: number;
  cooldownUntil: number;
  scanDate: string;
};

const burstMap = new Map<string, BurstState>();

export function getBurstState(userId: string, today: string): BurstState {
  let state = burstMap.get(userId);
  if (!state || state.scanDate !== today) {
    state = {
      burstCount: 0,
      lastScanTime: 0,
      cooldownUntil: 0,
      scanDate: today,
    };
    burstMap.set(userId, state);
  }
  return state;
}

export function checkBurst(state: BurstState): {
  allowed: boolean;
  reason?: string;
} {
  const now = Date.now();

  if (now < state.cooldownUntil) {
    return { allowed: false, reason: 'cooldown' };
  }

  state.cooldownUntil = 0;

  if (state.burstCount > 0) {
    const timeSinceLast = now - state.lastScanTime;
    if (timeSinceLast < MIN_SPACING_MS) {
      return { allowed: false, reason: 'spacing' };
    }
  }

  return { allowed: true };
}

export function recordBurst(state: BurstState) {
  const now = Date.now();

  state.burstCount++;
  state.lastScanTime = now;

  if (state.burstCount >= BURST_LIMIT) {
    state.cooldownUntil = now + COOLDOWN_MS;
  }
}
