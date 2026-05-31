import { TripDay } from "./types";

const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WEEKDAY_FULL = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

const HOLIDAYS_BW: Record<string, string> = {
  "2026-06-04": "Fronleichnam (BW)",
  "2026-05-25": "Pfingstmontag",
  "2026-05-14": "Christi Himmelfahrt",
  "2026-04-06": "Ostermontag",
  "2026-04-03": "Karfreitag",
  "2026-05-01": "Tag der Arbeit",
  "2026-10-03": "Tag der Deutschen Einheit",
};

function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeTripDays(start: string, end: string): TripDay[] {
  if (!start || !end) return [];
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (endDate < startDate) return [];

  const days: TripDay[] = [];
  const current = new Date(startDate);
  let i = 1;
  while (current <= endDate && i <= 60) {
    const iso = toIso(current);
    const dow = current.getDay();
    days.push({
      date: iso,
      weekday: WEEKDAY_SHORT[dow],
      full: WEEKDAY_FULL[dow],
      day: i,
      holiday: HOLIDAYS_BW[iso],
    });
    current.setDate(current.getDate() + 1);
    i++;
  }
  return days;
}

export function isValidDateRange(start: string, end: string): boolean {
  if (!start || !end) return false;
  const s = toDate(start);
  const e = toDate(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return false;
  if (e < s) return false;
  const diffMs = e.getTime() - s.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 60;
}
