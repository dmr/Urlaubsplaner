import { AppState, DEFAULT_STATE, RegionId, RegionState, ScheduleEntry } from "./types";

const STORAGE_KEY = "schwarzwald-loeffingen-2026-v4";
const LEGACY_V3 = "schwarzwald-loeffingen-2026-v3";
const LEGACY_V2 = "schwarzwald-loeffingen-2026-v2";

function emptyRegion(name: string): RegionState {
  return { schedule: {}, notes: {}, customOffers: [], dismissed: [], homeBaseName: name };
}

function normalizeRegion(name: string, raw: any): RegionState {
  const base = emptyRegion(name);
  if (!raw || typeof raw !== "object") return base;
  return {
    schedule: raw.schedule ?? {},
    notes: raw.notes ?? {},
    customOffers: raw.customOffers ?? [],
    dismissed: raw.dismissed ?? [],
    homeBaseName: raw.homeBaseName ?? name,
    startDate: typeof raw.startDate === "string" ? raw.startDate : undefined,
    endDate: typeof raw.endDate === "string" ? raw.endDate : undefined,
  };
}

function normalizeState(parsed: any): AppState {
  return {
    activeRegion: parsed.activeRegion ?? "loeffingen",
    regions: {
      loeffingen: normalizeRegion("Löffingen", parsed.regions?.loeffingen),
      udine: normalizeRegion("Udine", parsed.regions?.udine),
      freiburg: normalizeRegion("Freiburg", parsed.regions?.freiburg),
      hamburg: normalizeRegion("Hamburg", parsed.regions?.hamburg),
    },
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));

    const v3 = localStorage.getItem(LEGACY_V3);
    if (v3) {
      const migrated = normalizeState(JSON.parse(v3));
      if (!migrated.regions.loeffingen.startDate) {
        migrated.regions.loeffingen.startDate = "2026-05-25";
        migrated.regions.loeffingen.endDate = "2026-05-31";
      }
      saveState(migrated);
      return migrated;
    }

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
            startDate: "2026-05-25",
            endDate: "2026-05-31",
          },
          udine: emptyRegion("Udine"),
          freiburg: emptyRegion("Freiburg"),
          hamburg: emptyRegion("Hamburg"),
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
  localStorage.removeItem(LEGACY_V3);
  localStorage.removeItem(LEGACY_V2);
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export interface SharedPlan {
  regionId?: RegionId;
  startDate?: string;
  endDate?: string;
  homeBaseName: string;
  schedule: Record<string, string[]>;
  dismissed: string[];
}

export function encodeStateToUrl(regionId: RegionId, region: RegionState): string {
  const compact: Record<string, string[]> = {};
  for (const [date, entries] of Object.entries(region.schedule)) {
    const ids = entries.filter((e) => e.type === "offer" && e.offerId).map((e) => e.offerId!);
    if (ids.length > 0) compact[date] = ids;
  }
  const payload: Record<string, unknown> = {
    r: regionId,
    s: compact,
    h: region.homeBaseName,
  };
  if (region.startDate) payload.sd = region.startDate;
  if (region.endDate) payload.ed = region.endDate;
  if (region.dismissed.length > 0) payload.d = region.dismissed;
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function decodeStateFromUrl(encoded: string): SharedPlan | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(json);
    return {
      regionId: typeof data.r === "string" ? data.r : undefined,
      startDate: typeof data.sd === "string" ? data.sd : undefined,
      endDate: typeof data.ed === "string" ? data.ed : undefined,
      schedule: data.s ?? {},
      homeBaseName: data.h ?? "",
      dismissed: data.d ?? [],
    };
  } catch {
    return null;
  }
}

export function importState(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed && parsed.regions) return normalizeState(parsed);
    return null;
  } catch {
    return null;
  }
}
