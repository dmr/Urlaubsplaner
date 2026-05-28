import { Offer, RegionId } from "@/lib/types";
import { OFFERS } from "@/data/offers";
import { OFFER_COORDS } from "@/data/coords";
import { hikingRoutesAsOffers } from "@/data/hikingRoutes";
import { OFFERS_UDINE, OFFER_COORDS_UDINE } from "@/data/offersUdine";
import { hikingRoutesUdineAsOffers, HIKING_ROUTES_UDINE } from "@/data/hikingRoutesUdine";
import { OFFERS_FREIBURG, OFFER_COORDS_FREIBURG } from "@/data/offersFreiburg";
import { hikingRoutesFreiburgAsOffers, HIKING_ROUTES_FREIBURG } from "@/data/hikingRoutesFreiburg";
import { REGIONS } from "@/data/regions";

const cache: Partial<Record<RegionId, Offer[]>> = {};

function attachCoords(offers: Offer[], coords: Record<string, [number, number]>): Offer[] {
  return offers.map((o) => {
    if (o.coords) return o;
    const c = coords[o.id] ?? o.hikeDetails?.parking?.coords;
    return c ? { ...o, coords: c } : o;
  });
}

function hikeCoordsFor(routes: { id: string; parking?: { coords: [number, number] } }[]): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  for (const r of routes) {
    if (r.parking) out[`hike-${r.id}`] = r.parking.coords;
  }
  return out;
}

export function offersForRegion(region: RegionId): Offer[] {
  if (cache[region]) return cache[region]!;
  let result: Offer[];
  if (region === "udine") {
    const hb = REGIONS.udine.homeBase;
    result = attachCoords(
      [...OFFERS_UDINE, ...hikingRoutesUdineAsOffers([hb.lat, hb.lng])],
      { ...OFFER_COORDS_UDINE, ...hikeCoordsFor(HIKING_ROUTES_UDINE) }
    );
  } else if (region === "freiburg") {
    const hb = REGIONS.freiburg.homeBase;
    result = attachCoords(
      [...OFFERS_FREIBURG, ...hikingRoutesFreiburgAsOffers([hb.lat, hb.lng])],
      { ...OFFER_COORDS_FREIBURG, ...hikeCoordsFor(HIKING_ROUTES_FREIBURG) }
    );
  } else {
    result = attachCoords([...OFFERS, ...hikingRoutesAsOffers()], OFFER_COORDS);
  }
  cache[region] = result;
  return result;
}
