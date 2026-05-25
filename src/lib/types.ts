export type OfferTag =
  | "outdoor"
  | "indoor"
  | "mix"
  | "water"
  | "animals"
  | "hike"
  | "train"
  | "thrill"
  | "badWeather";

export type Price = "€" | "€€" | "€€€" | "Gratis";

export interface Offer {
  id: string;
  name: string;
  sub: string;
  location: string;
  /** km from Löffingen (road distance, approximate) */
  distance: number;
  duration: string;
  /** 0 if no age restriction */
  minAge: number;
  tags: OfferTag[];
  price: Price;
  /** Hochschwarzwald Card: 1× free included during stay */
  cardIncluded: boolean;
  /** Optional Card discount text (e.g. "30 % auf 4h-Ticket") */
  cardDiscount?: string;
  description: string;
  pro?: string;
  con?: string;
  /** Explicit warning rendered prominently */
  warning?: string;
  url?: string;
}

export interface TripDay {
  /** ISO date 'YYYY-MM-DD' */
  date: string;
  /** Short label 'Mo' */
  weekday: string;
  /** Long label 'Montag' */
  full: string;
  /** 1..7 */
  day: number;
  /** German holiday or special note */
  holiday?: string;
}

export interface AppState {
  /** date -> [offerId] */
  plan: Record<string, string[]>;
  /** date -> note */
  notes: Record<string, string>;
  /** User-defined offers (UI not yet implemented) */
  customOffers: Offer[];
}

export const DEFAULT_STATE: AppState = {
  plan: {},
  notes: {},
  customOffers: [],
};
