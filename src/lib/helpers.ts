import { Offer } from "./types";
import { OFFERS } from "@/data/offers";

/**
 * Look up an offer by ID in the built-in catalog and the user's custom offers.
 */
export function offerById(
  id: string,
  customOffers: Offer[] = []
): Offer | undefined {
  return OFFERS.find((o) => o.id === id) ?? customOffers.find((o) => o.id === id);
}

/**
 * Compute a UI warning string for an offer, given the youngest child is 3.
 * Returns null when no warning applies.
 */
export function ageWarning(offer: Offer): string | null {
  if (offer.warning) return offer.warning;
  if (offer.minAge && offer.minAge > 3) {
    return `Mindestalter ${offer.minAge} — euer 3-Jähriger ist drunter.`;
  }
  return null;
}

/**
 * Format an ISO date as 'D. Juni' (German).
 */
export function formatDayMonth(isoDate: string): string {
  const d = new Date(isoDate);
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  return `${d.getDate()}. ${monthNames[d.getMonth()]}`;
}
