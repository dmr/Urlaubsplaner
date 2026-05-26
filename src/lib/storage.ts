import { AppState, DEFAULT_STATE, ScheduleEntry } from "./types";

const STORAGE_KEY = "schwarzwald-loeffingen-2026-v2";
const LEGACY_KEY = "schwarzwald-loeffingen-2026-v1";

let entryCounter = 0;
function nextEntryId(): string {
  return `entry-${Date.now()}-${++entryCounter}`;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    }

    // Migrate from v1 (had separate plan + schedule)
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy);
      const schedule: Record<string, ScheduleEntry[]> = old.schedule ?? {};

      // Migrate plan entries into schedule if they aren't there yet
      if (old.plan) {
        for (const [date, offerIds] of Object.entries(old.plan)) {
          const ids = offerIds as string[];
          const existing = schedule[date] ?? [];
          const existingOfferIds = new Set(
            existing.filter((e) => e.type === "offer").map((e) => e.offerId)
          );
          for (const offerId of ids) {
            if (!existingOfferIds.has(offerId)) {
              existing.push({ id: nextEntryId(), type: "offer", offerId });
            }
          }
          schedule[date] = existing;
        }
      }

      const migrated: AppState = {
        schedule,
        notes: old.notes ?? {},
        customOffers: old.customOffers ?? [],
        dismissed: old.dismissed ?? [],
      };
      saveState(migrated);
      return migrated;
    }

    return DEFAULT_STATE;
  } catch (err) {
    console.warn("[storage] load failed, resetting", err);
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error("[storage] save failed", err);
    return false;
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.schedule === "object") {
      return { ...DEFAULT_STATE, ...parsed };
    }
    // Try legacy format
    if (parsed && typeof parsed.plan === "object") {
      const schedule: Record<string, ScheduleEntry[]> = parsed.schedule ?? {};
      for (const [date, offerIds] of Object.entries(parsed.plan)) {
        const ids = offerIds as string[];
        const existing = schedule[date] ?? [];
        for (const offerId of ids) {
          existing.push({ id: nextEntryId(), type: "offer", offerId });
        }
        schedule[date] = existing;
      }
      return { schedule, notes: parsed.notes ?? {}, customOffers: parsed.customOffers ?? [], dismissed: parsed.dismissed ?? [] };
    }
    return null;
  } catch {
    return null;
  }
}
