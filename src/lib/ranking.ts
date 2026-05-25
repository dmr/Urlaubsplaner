import { Offer, ScheduleEntry } from "@/lib/types";

export type SortKey = "empfohlen" | "distanz" | "name" | "preis";

interface RankingFactors {
  distanceScore: number;
  cardScore: number;
  familyScore: number;
  weatherScore: number;
  varietyScore: number;
  total: number;
}

const PRICE_ORDER: Record<string, number> = {
  "Gratis": 0,
  "€": 1,
  "€€": 2,
  "€€€": 3,
};

export function computeRanking(
  offer: Offer,
  schedule: Record<string, ScheduleEntry[]>,
  activeDate: string
): RankingFactors {
  // 1. Nähe (0–25 Punkte): je näher, desto besser
  const distanceScore = Math.max(0, 25 - (offer.distance / 80) * 25);

  // 2. Card-Wert (0–20 Punkte): Card-inkl. spart Geld
  const cardScore = offer.cardIncluded ? 20 : offer.cardDiscount ? 10 : 0;

  // 3. Familientauglichkeit (0–30 Punkte)
  let familyScore = 15;
  if (offer.minAge === 0) familyScore = 30;
  else if (offer.minAge <= 3) familyScore = 25;
  else if (offer.minAge <= 5) familyScore = 15;
  else familyScore = 5;
  if (offer.warning) familyScore = Math.max(0, familyScore - 10);

  // 4. Schlechtwetter-Bonus (0–10 Punkte)
  const weatherScore = offer.tags.includes("badWeather") || offer.tags.includes("indoor") ? 10 : 5;

  // 5. Vielfalt-Bonus (0–15 Punkte): Abzug wenn schon geplant
  let varietyScore = 15;

  // Abzug wenn am selben Tag schon geplant
  const dayEntries = schedule[activeDate] ?? [];
  if (dayEntries.some((e) => e.type === "offer" && e.offerId === offer.id)) {
    varietyScore = 0;
  }

  const total = Math.round(distanceScore + cardScore + familyScore + weatherScore + varietyScore);

  return { distanceScore, cardScore, familyScore, weatherScore, varietyScore, total };
}

export function sortOffers(
  offers: Offer[],
  sortKey: SortKey,
  schedule: Record<string, ScheduleEntry[]>,
  activeDate: string
): Offer[] {
  const sorted = [...offers];

  const isPlannedToday = (o: Offer) =>
    (schedule[activeDate] ?? []).some((e) => e.type === "offer" && e.offerId === o.id);

  switch (sortKey) {
    case "empfohlen":
      sorted.sort((a, b) => {
        const aPlanned = isPlannedToday(a);
        const bPlanned = isPlannedToday(b);
        if (aPlanned !== bPlanned) return aPlanned ? 1 : -1;
        return computeRanking(b, schedule, activeDate).total -
               computeRanking(a, schedule, activeDate).total;
      });
      break;
    case "distanz":
      sorted.sort((a, b) => {
        const aPlanned = isPlannedToday(a);
        const bPlanned = isPlannedToday(b);
        if (aPlanned !== bPlanned) return aPlanned ? 1 : -1;
        return a.distance - b.distance;
      });
      break;
    case "name":
      sorted.sort((a, b) => {
        const aPlanned = isPlannedToday(a);
        const bPlanned = isPlannedToday(b);
        if (aPlanned !== bPlanned) return aPlanned ? 1 : -1;
        return a.name.localeCompare(b.name, "de");
      });
      break;
    case "preis":
      sorted.sort((a, b) => {
        const aPlanned = isPlannedToday(a);
        const bPlanned = isPlannedToday(b);
        if (aPlanned !== bPlanned) return aPlanned ? 1 : -1;
        return (PRICE_ORDER[a.price] ?? 2) - (PRICE_ORDER[b.price] ?? 2);
      });
      break;
  }

  return sorted;
}

export function getRankingExplanation(factors: RankingFactors): string[] {
  const lines: string[] = [];
  if (factors.distanceScore >= 20) lines.push("Sehr nah");
  else if (factors.distanceScore >= 10) lines.push("Moderate Entfernung");
  else lines.push("Weiter weg");

  if (factors.cardScore === 20) lines.push("Card-inkl. — spart Eintritt");
  else if (factors.cardScore === 10) lines.push("Card-Rabatt verfügbar");

  if (factors.familyScore >= 25) lines.push("Ideal für alle Altersgruppen");
  else if (factors.familyScore >= 15) lines.push("Für ältere Kinder geeignet");
  else lines.push("Eingeschränkt familientauglich");

  if (factors.weatherScore === 10) lines.push("Auch bei Regen gut");

  return lines;
}
