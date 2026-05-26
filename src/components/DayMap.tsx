import { useEffect, useRef } from "react";
import { ScheduleEntry } from "@/lib/types";
import { offerById, hikeById } from "@/lib/helpers";
import { OFFER_COORDS, googleMapsDirectionsUrl } from "@/data/coords";
import { HIKING_ROUTES } from "@/data/hikingRoutes";
import { Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LOEFFINGEN: [number, number] = [47.884, 8.343];

export default function DayMap({
  entries,
  customOffers,
}: {
  entries: ScheduleEntry[];
  customOffers: import("@/lib/types").Offer[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const items: { name: string; coords: [number, number]; type: "offer" | "hike"; color: string }[] = [];

  for (const entry of entries) {
    if (entry.type === "offer" && entry.offerId) {
      const offer = offerById(entry.offerId, customOffers);
      const coords = OFFER_COORDS[entry.offerId];
      if (offer && coords) {
        items.push({
          name: offer.name,
          coords,
          type: "offer",
          color: offer.cardIncluded ? "#c98a3a" : "#5a7f4b",
        });
      }
    }
    if (entry.type === "hike" && entry.hikeId) {
      const hike = hikeById(entry.hikeId);
      if (hike && hike.parking) {
        items.push({
          name: hike.name,
          coords: hike.parking.coords,
          type: "hike",
          color: hike.difficulty === "leicht" ? "#5a7f4b" : hike.difficulty === "mittel" ? "#c98a3a" : "#7d1f1f",
        });
      }
    }
  }

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    if (items.length === 0) return;

    const map = L.map(mapRef.current, {
      center: LOEFFINGEN,
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 15,
    }).addTo(map);

    const markers: L.LatLng[] = [];

    // Löffingen home marker
    L.circleMarker(LOEFFINGEN, {
      radius: 5,
      fillColor: "#f3ead7",
      color: "#162820",
      weight: 1.5,
      fillOpacity: 0.8,
    }).addTo(map).bindPopup("<b>Löffingen</b> (Unterkunft)");

    items.forEach((item, i) => {
      const marker = L.circleMarker(item.coords, {
        radius: 9,
        fillColor: item.color,
        color: "#f3ead7",
        weight: 2,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif;">
          <b>${i + 1}. ${item.name}</b>
          ${item.type === "hike" ? "<br>🥾 Wanderung" : ""}
        </div>
      `);

      // Number label
      L.marker(item.coords, {
        icon: L.divIcon({
          className: "",
          html: `<div style="color:#f3ead7;font-size:11px;font-weight:700;text-align:center;line-height:18px;width:18px;height:18px;">${i + 1}</div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      }).addTo(map);

      markers.push(L.latLng(item.coords));
    });

    // Draw route line between activities in order
    if (items.length > 1) {
      const routeCoords: [number, number][] = [LOEFFINGEN, ...items.map((i) => i.coords)];
      L.polyline(routeCoords, {
        color: "#c98a3a",
        weight: 2,
        opacity: 0.5,
        dashArray: "6 4",
      }).addTo(map);
    }

    // Add hiking route paths
    for (const entry of entries) {
      if (entry.type === "hike" && entry.hikeId) {
        const route = HIKING_ROUTES.find((r) => r.id === entry.hikeId);
        if (route && route.path.length > 1) {
          L.polyline(route.path, {
            color: route.difficulty === "leicht" ? "#5a7f4b" : route.difficulty === "mittel" ? "#c98a3a" : "#7d1f1f",
            weight: 3,
            opacity: 0.7,
          }).addTo(map);
        }
      }
    }

    markers.push(L.latLng(LOEFFINGEN));
    if (markers.length > 1) {
      map.fitBounds(L.latLngBounds(markers), { padding: [30, 30] });
    } else if (markers.length === 1) {
      map.setView(markers[0], 13);
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [entries.map((e) => e.id).join(",")]);

  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="text-[10px] tracking-[0.18em] uppercase text-moss-soft mb-1.5 flex items-center gap-1">
        <Navigation size={10} /> Tagesroute
      </div>
      <div
        ref={mapRef}
        className="w-full h-[200px] rounded-lg overflow-hidden border border-moss/20"
      />
      <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-moss-soft">
        {items.map((item, i) => (
          <a
            key={i}
            href={googleMapsDirectionsUrl(item.coords[0], item.coords[1])}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-cream transition-colors"
          >
            <span
              className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-cream"
              style={{ backgroundColor: item.color }}
            >
              {i + 1}
            </span>
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
}
