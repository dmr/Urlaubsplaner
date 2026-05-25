import { AppState, DEFAULT_STATE } from "./types";

const STORAGE_KEY = "schwarzwald-loeffingen-2026-v1";

/**
 * Load app state from localStorage.
 * Returns DEFAULT_STATE if nothing stored or parse fails.
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (err) {
    console.warn("[storage] load failed, resetting", err);
    return DEFAULT_STATE;
  }
}

/**
 * Persist app state to localStorage. Returns true on success.
 */
export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error("[storage] save failed", err);
    return false;
  }
}

/**
 * Wipe stored state.
 */
export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
