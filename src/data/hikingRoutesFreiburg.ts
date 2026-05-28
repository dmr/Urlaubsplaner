import { HikingRoute, hikingRoutesAsOffersGeneric } from "@/data/hikingRoutes";
import { Offer } from "@/lib/types";

// Freiburg — Wanderrouten (Recherche Mai 2026)
export const HIKING_ROUTES_FREIBURG: HikingRoute[] = [];

export function hikingRoutesFreiburgAsOffers(homeBase: [number, number]): Offer[] {
  return hikingRoutesAsOffersGeneric(HIKING_ROUTES_FREIBURG, homeBase);
}
