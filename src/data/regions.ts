import { Region, RegionId } from "@/lib/types";

export const REGIONS: Record<RegionId, Region> = {
  loeffingen: {
    id: "loeffingen",
    name: "Schwarzwald · Löffingen",
    homeBase: { name: "Löffingen", lat: 47.884, lng: 8.343 },
    mapCenter: [47.884, 8.343],
    mapZoom: 11,
  },
  udine: {
    id: "udine",
    name: "Friaul · Udine",
    homeBase: { name: "Udine", lat: 46.0711, lng: 13.2346 },
    mapCenter: [46.15, 13.2],
    mapZoom: 9,
  },
};

export const REGION_LIST: Region[] = [REGIONS.loeffingen, REGIONS.udine];
