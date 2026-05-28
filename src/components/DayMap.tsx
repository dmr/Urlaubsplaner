import { useEffect, useRef } from "react";
import { ScheduleEntry } from "@/lib/types";
import { offerById } from "@/lib/helpers";
import { googleMapsDirectionsUrl } from "@/data/coords";
import { Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function DayMap({
  entries,
  customOffers,
  highlightedId,
  homeBase,
}: {
  entries: ScheduleEntry[];
  customOffers: import("@/lib/types").Offer[];
  highlightedId?: string | null;
  homeBase: { name: string; lat: number; lng: number };
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const HOME: [number, number] = [homeBase.lat, homeBase.lng];

  const items: { name: string; coords: [number, number]; isHike: boolean; color: string; offerId: string; path?: [number, number][] }[] = [];

  for (const entry of entries) {
    if (entry.type === "offer" && entry.offerId) {
      const offer = offerById(entry.offerId, customOffers);
      const coords = offer?.coords ?? offer?.hikeDetails?.parking?.coords;
      if (offer && coords) {
        items.push({
          name: offer.name,
          coords,
          isHike: !!offer.hikeDetails,
          color: offer.hikeDetails
            ? (offer.hikeDetails.difficulty === "leicht" ? "#6a9458" : offer.hikeDetails.difficulty === "mittel" ? "#d49540" : "#a03030")
            : offer.cardIncluded ? "#d49540" : "#6a9458",
          offerId: entry.offerId,
          path: offer.hikeDetails?.path,
        });
      }
    }
  }

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    if (items.length === 0) return;

    const map = L.map(mapRef.current, {
      center: HOME, zoom: 10, zoomControl: false, attributionControl: false, scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 15 }).addTo(map);

    const markers: L.LatLng[] = [];

    L.circleMarker(HOME, { radius: 5, fillColor: "#f3ead7", color: "#162820", weight: 1.5, fillOpacity: 0.8 })
      .addTo(map).bindPopup(`<b>${homeBase.name}</b>`);

    items.forEach((item, i) => {
      const isHighlighted = highlightedId === item.offerId;
      const marker = L.circleMarker(item.coords, {
        radius: isHighlighted ? 14 : 9,
        fillColor: isHighlighted ? "#d49540" : item.color,
        color: isHighlighted ? "#fff" : "#f3ead7",
        weight: isHighlighted ? 3 : 2,
        fillOpacity: isHighlighted ? 1 : 0.9,
      }).addTo(map).bindPopup(`<b>${i + 1}. ${item.name}</b>${item.isHike ? "<br>🥾 Wanderung" : ""}`);
      if (isHighlighted) { marker.openPopup(); map.panTo(item.coords); }

      L.marker(item.coords, {
        icon: L.divIcon({
          className: "",
          html: `<div style="color:#f3ead7;font-size:11px;font-weight:700;text-align:center;line-height:18px;width:18px;height:18px;">${i + 1}</div>`,
          iconSize: [18, 18], iconAnchor: [9, 9],
        }),
      }).addTo(map);

      markers.push(L.latLng(item.coords));
    });

    if (items.length > 1) {
      L.polyline([HOME, ...items.map((i) => i.coords)], {
        color: "#d49540", weight: 2, opacity: 0.5, dashArray: "6 4",
      }).addTo(map);
    }

    // Draw hiking route paths
    for (const item of items) {
      if (item.path && item.path.length > 1) {
        L.polyline(item.path, { color: item.color, weight: 3, opacity: 0.7 }).addTo(map);
      }
    }

    markers.push(L.latLng(HOME));
    if (markers.length > 1) map.fitBounds(L.latLngBounds(markers), { padding: [30, 30] });
    else if (markers.length === 1) map.setView(markers[0], 13);

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, [entries.map((e) => e.id).join(","), highlightedId]);

  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="text-[10px] tracking-[0.18em] uppercase text-moss-soft mb-1.5 flex items-center gap-1">
        <Navigation size={10} /> Tagesroute
      </div>
      <div ref={mapRef} className="w-full h-[200px] rounded-lg overflow-hidden border border-moss/20" />
      <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-moss-soft">
        {items.map((item, i) => (
          <a key={i} href={googleMapsDirectionsUrl(item.coords[0], item.coords[1])} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-cream transition-colors">
            <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-cream" style={{ backgroundColor: item.color }}>{i + 1}</span>
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
}
