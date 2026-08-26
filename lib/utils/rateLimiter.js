/**
 * Client-side Rate Limiter Utility for Sensitive Admin Actions (#311).
 * ---------------------------------------------------------------------------
 * Implements a sliding-window rate limiter to detect rapid repeated confirmations
 * and enforce a cooldown period to prevent accidental or scripted fat-finger operations.
 */

// In-memory timestamp store for rapid actions
const actionHistory = new Map();
const activeCooldowns = new Map();

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_WINDOW_MS = 30000; // 30 seconds
const DEFAULT_COOLDOWN_MS = 15000; // 15 seconds

/**
 * Check if an action is currently rate-limited or in a cooldown state.
 *
 * @param {string} [key="default"] Action identifier key (e.g. "admin_confirm_action")
 * @param {number} [maxAttempts=3] Max allowed confirms in window
 * @param {number} [windowMs=30000] Sliding window in ms
 * @param {number} [cooldownMs=15000] Cooldown duration in ms
 * @returns {{ allowed: boolean, remainingMs: number, cooldownSec: number }}
 */
export function checkRateLimit(
  key = "default",
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  windowMs = DEFAULT_WINDOW_MS,
  cooldownMs = DEFAULT_COOLDOWN_MS
) {
  const now = Date.now();

  // Check if actively in cooldown
  const cooldownUntil = activeCooldowns.get(key);
  if (cooldownUntil && now < cooldownUntil) {
    const remainingMs = cooldownUntil - now;
    return {
      allowed: false,
      remainingMs,
      cooldownSec: Math.ceil(remainingMs / 1000),
    };
  } else if (cooldownUntil) {
    activeCooldowns.delete(key);
  }

  // Filter timestamps within the sliding window
  const history = actionHistory.get(key) || [];
  const recentHistory = history.filter((ts) => now - ts < windowMs);
  actionHistory.set(key, recentHistory);

  if (recentHistory.length >= maxAttempts) {
    // Trigger new cooldown
    const newCooldownUntil = now + cooldownMs;
    activeCooldowns.set(key, newCooldownUntil);
    return {
      allowed: false,
      remainingMs: cooldownMs,
      cooldownSec: Math.ceil(cooldownMs / 1000),
    };
  }

  return {
    allowed: true,
    remainingMs: 0,
    cooldownSec: 0,
  };
}

/**
 * Record a successful confirmation action execution.
 *
 * @param {string} [key="default"]
 */
export function recordActionAttempt(key = "default") {
  const now = Date.now();
  const history = actionHistory.get(key) || [];
  history.push(now);
  actionHistory.set(key, history);
}

/**
 * Reset rate limit history for a key (for testing or reset flows).
 *
 * @param {string} [key="default"]
 */
export function resetRateLimit(key = "default") {
  actionHistory.delete(key);
  activeCooldowns.delete(key);
}
