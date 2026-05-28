export type OfferTag =
  | "outdoor"
  | "indoor"
  | "mix"
  | "water"
  | "animals"
  | "hike"
  | "train"
  | "thrill"
  | "badWeather"
  | "culture"
  | "nature"
  | "viewpoint"
  | "waterfall";

export type Price = "€" | "€€" | "€€€" | "Gratis";

export interface HikeDetails {
  difficulty: "leicht" | "mittel" | "schwer";
  elevation: string;
  path: [number, number][];
  parking?: {
    name: string;
    address: string;
    coords: [number, number];
    cost: string;
    notes?: string;
  };
  elevationProfile?: {
    start: number;
    max: number;
    totalAscent: number;
    totalDescent: number;
    waypoints: { name: string; elevation: number; km: number }[];
  };
  surface: string;
  facilities: string[];
  photoSpots: { description: string; image?: string }[];
  strollerFriendly: boolean;
  whatToPack?: string[];
  bestTime?: string;
  waterSources?: string;
  emergencyInfo?: string;
  shorterVariant?: string;
  weatherNotes?: string;
}

export interface Offer {
  id: string;
  name: string;
  sub: string;
  location: string;
  distance: number;
  duration: string;
  minAge: number;
  tags: OfferTag[];
  price: Price;
  cardIncluded: boolean;
  cardDiscount?: string;
  description: string;
  pro?: string;
  con?: string;
  warning?: string;
  url?: string;
  availableDays?: string[];
  images?: string[];
  hikeDetails?: HikeDetails;
  source?: string;
  coords?: [number, number];
}

export type RegionId = "loeffingen" | "udine" | "freiburg";

export interface Region {
  id: RegionId;
  name: string;
  homeBase: { name: string; lat: number; lng: number };
  mapCenter: [number, number];
  mapZoom: number;
}

export interface TripDay {
  date: string;
  weekday: string;
  full: string;
  day: number;
  holiday?: string;
}

export type BreakType = "breakfast" | "lunch" | "dinner" | "snack" | "pause";

export interface ScheduleEntry {
  id: string;
  type: "offer" | "break";
  offerId?: string;
  breakType?: BreakType;
  label?: string;
  startTime?: string;
  endTime?: string;
}

export interface RegionState {
  schedule: Record<string, ScheduleEntry[]>;
  notes: Record<string, string>;
  customOffers: Offer[];
  dismissed: string[];
  homeBaseName: string;
}

export interface AppState {
  activeRegion: RegionId;
  regions: Record<RegionId, RegionState>;
}

const EMPTY_REGION: RegionState = {
  schedule: {},
  notes: {},
  customOffers: [],
  dismissed: [],
  homeBaseName: "",
};

export const DEFAULT_STATE: AppState = {
  activeRegion: "loeffingen",
  regions: {
    loeffingen: { ...EMPTY_REGION, homeBaseName: "Löffingen" },
    udine: { ...EMPTY_REGION, homeBaseName: "Udine" },
    freiburg: { ...EMPTY_REGION, homeBaseName: "Freiburg" },
  },
};
