import { TripDay } from "@/lib/types";

export const TRIP_DAYS: TripDay[] = [
  { date: "2026-06-01", weekday: "Mo", full: "Montag", day: 1 },
  { date: "2026-06-02", weekday: "Di", full: "Dienstag", day: 2 },
  { date: "2026-06-03", weekday: "Mi", full: "Mittwoch", day: 3 },
  {
    date: "2026-06-04",
    weekday: "Do",
    full: "Donnerstag",
    day: 4,
    holiday: "Fronleichnam — überfüllt!",
  },
  { date: "2026-06-05", weekday: "Fr", full: "Freitag", day: 5 },
  { date: "2026-06-06", weekday: "Sa", full: "Samstag", day: 6 },
  { date: "2026-06-07", weekday: "So", full: "Sonntag", day: 7 },
];
