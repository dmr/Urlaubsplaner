import { Offer, RegionId } from "@/lib/types";
import { OFFERS } from "@/data/offers";
import { OFFER_COORDS } from "@/data/coords";
import { hikingRoutesAsOffers } from "@/data/hikingRoutes";
import { OFFERS_UDINE, OFFER_COORDS_UDINE } from "@/data/offersUdine";
import { hikingRoutesUdineAsOffers, HIKING_ROUTES_UDINE } from "@/data/hikingRoutesUdine";
import { REGIONS } from "@/data/regions";

const cache: Partial<Record<RegionId, Offer[]>> = {};

function attachCoords(offers: Offer[], coords: Record<string, [number, number]>): Offer[] {
  return offers.map((o) => {
    if (o.coords) return o;
    const c = coords[o.id] ?? o.hikeDetails?.parking?.coords;
    return c ? { ...o, coords: c } : o;
  });
}

export function offersForRegion(region: RegionId): Offer[] {
  if (cache[region]) return cache[region]!;
  let result: Offer[];
  if (region === "udine") {
    const hb = REGIONS.udine.homeBase;
    const hikeCoords: Record<string, [number, number]> = {};
    for (const r of HIKING_ROUTES_UDINE) {
      if (r.parking) hikeCoords[`hike-${r.id}`] = r.parking.coords;
    }
    result = attachCoords(
      [...OFFERS_UDINE, ...hikingRoutesUdineAsOffers([hb.lat, hb.lng])],
      { ...OFFER_COORDS_UDINE, ...hikeCoords }
    );
  } else {
    result = attachCoords([...OFFERS, ...hikingRoutesAsOffers()], OFFER_COORDS);
  }
  cache[region] = result;
  return result;
}
