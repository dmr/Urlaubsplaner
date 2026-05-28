import { AppState, DEFAULT_STATE, RegionState, ScheduleEntry } from "./types";

const STORAGE_KEY = "schwarzwald-loeffingen-2026-v3";
const LEGACY_V2 = "schwarzwald-loeffingen-2026-v2";

function emptyRegion(name: string): RegionState {
  return { schedule: {}, notes: {}, customOffers: [], dismissed: [], homeBaseName: name };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        activeRegion: parsed.activeRegion ?? "loeffingen",
        regions: {
          loeffingen: { ...emptyRegion("Löffingen"), ...(parsed.regions?.loeffingen ?? {}) },
          udine: { ...emptyRegion("Udine"), ...(parsed.regions?.udine ?? {}) },
        },
      };
    }

    // Migrate flat v2 state into loeffingen region
    const v2 = localStorage.getItem(LEGACY_V2);
    if (v2) {
      const old = JSON.parse(v2);
      const schedule: Record<string, ScheduleEntry[]> = {};
      for (const [date, entries] of Object.entries(old.schedule ?? {})) {
        schedule[date] = (entries as ScheduleEntry[]).map((e: any) =>
          e.type === "hike" && e.hikeId
            ? { ...e, type: "offer" as const, offerId: `hike-${e.hikeId}`, hikeId: undefined }
            : e
        );
      }
      const migrated: AppState = {
        activeRegion: "loeffingen",
        regions: {
          loeffingen: {
            schedule,
            notes: old.notes ?? {},
            customOffers: old.customOffers ?? [],
            dismissed: old.dismissed ?? [],
            homeBaseName: old.homeBase?.name ?? "Löffingen",
          },
          udine: emptyRegion("Udine"),
        },
      };
      saveState(migrated);
      return migrated;
    }

    return structuredClone(DEFAULT_STATE);
  } catch (err) {
    console.warn("[storage] load failed, resetting", err);
    return structuredClone(DEFAULT_STATE);
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
  localStorage.removeItem(LEGACY_V2);
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function encodeStateToUrl(region: RegionState): string {
  const compact: Record<string, string[]> = {};
  for (const [date, entries] of Object.entries(region.schedule)) {
    const ids = entries.filter((e) => e.type === "offer" && e.offerId).map((e) => e.offerId!);
    if (ids.length > 0) compact[date] = ids;
  }
  const payload: Record<string, unknown> = { s: compact, h: region.homeBaseName };
  if (region.dismissed.length > 0) payload.d = region.dismissed;
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function decodeStateFromUrl(encoded: string): { schedule: Record<string, string[]>; homeBaseName: string; dismissed: string[] } | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(json);
    return { schedule: data.s ?? {}, homeBaseName: data.h ?? "", dismissed: data.d ?? [] };
  } catch {
    return null;
  }
}

export function importState(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed && parsed.regions) {
      return {
        activeRegion: parsed.activeRegion ?? "loeffingen",
        regions: {
          loeffingen: { ...emptyRegion("Löffingen"), ...(parsed.regions.loeffingen ?? {}) },
          udine: { ...emptyRegion("Udine"), ...(parsed.regions.udine ?? {}) },
        },
      };
    }
    return null;
  } catch {
    return null;
  }
}
