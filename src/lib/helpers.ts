import { Offer, ScheduleEntry } from "./types";
import { OFFERS } from "@/data/offers";

export function offerById(
  id: string,
  customOffers: Offer[] = []
): Offer | undefined {
  return OFFERS.find((o) => o.id === id) ?? customOffers.find((o) => o.id === id);
}

export function ageWarning(offer: Offer): string | null {
  if (offer.warning) return offer.warning;
  if (offer.minAge && offer.minAge > 3) {
    return `Mindestalter ${offer.minAge} — euer 3-Jähriger ist drunter.`;
  }
  return null;
}

export function formatDayMonth(isoDate: string): string {
  const d = new Date(isoDate);
  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${d.getDate()}. ${monthNames[d.getMonth()]}`;
}

export function getPlannedOfferIds(entries: ScheduleEntry[]): string[] {
  return entries
    .filter((e) => e.type === "offer" && e.offerId)
    .map((e) => e.offerId!);
}

export function isOfferPlannedOnDate(
  schedule: Record<string, ScheduleEntry[]>,
  offerId: string,
  date: string
): boolean {
  return (schedule[date] ?? []).some(
    (e) => e.type === "offer" && e.offerId === offerId
  );
}

export function isOfferPlannedAnyDay(
  schedule: Record<string, ScheduleEntry[]>,
  offerId: string
): string | null {
  for (const [date, entries] of Object.entries(schedule)) {
    if (entries.some((e) => e.type === "offer" && e.offerId === offerId)) {
      return date;
    }
  }
  return null;
}
